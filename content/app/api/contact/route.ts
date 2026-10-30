import { contactScopes } from "@/content/contact";
import { createContactTransport } from "@/lib/contact-mail.mjs";

// Per-instance throttling complements deployment-level abuse protection.
const attempts = new Map<string, { count: number; expires: number }>();
const reply = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply("This request is not allowed.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply("Please send a valid inquiry.", 415);
  if (Number(request.headers.get("content-length")) > 16000) return reply("Your inquiry is too long.", 413);

  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return reply("Your inquiry is too long.", 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply("Please send a valid inquiry.", 400);
    data = parsed as Record<string, unknown>;
  } catch { return reply("Please send a valid inquiry.", 400); }

  if (data.website) return reply("Please send a valid inquiry.", 400);
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (!name || name.length > 120 || /[\r\n]/.test(name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 5000) {
    return reply("Please enter a valid name, email, and project description (up to 5,000 characters).", 400);
  }
  const scopes = data.scopes ?? [];
  if (!Array.isArray(scopes) || scopes.length > contactScopes.length || scopes.some(scope => typeof scope !== "string" || !contactScopes.includes(scope))) {
    return reply("Please choose a valid project scope.", 400);
  }

  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  const key = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const limit = attempts.get(key) ?? { count: 0, expires: now + 15 * 60 * 1000 };
  if (limit.count >= 5 || attempts.size >= 1000) return reply("Too many inquiries. Please try again in 15 minutes or contact us directly.", 429);
  limit.count++; attempts.set(key, limit);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.CONTACT_TO_EMAIL) {
    return reply("Email is temporarily unavailable. Please use our direct email or WhatsApp link.", 503);
  }
  try {
    const transport = createContactTransport();
    const result = await transport.sendMail({
      from: { name: "PROSPERA website", address: process.env.SMTP_USER },
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: { name, address: email },
      subject: "New project inquiry — PROSPERA",
      text: `New inquiry from the PROSPERA website\n\nName: ${name}\nEmail: ${email}\nScope: ${scopes.length ? scopes.join(", ") : "Not specified"}\n\nProject description:\n${message}`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted.length || result.rejected.length) throw new Error("MAIL_NOT_ACCEPTED");
    // The inquiry has reached the studio. A confirmation failure must not
    // report the inquiry as failed and encourage duplicate submissions.
    let confirmationSent = false;
    try {
      const confirmation = await transport.sendMail({
        from: { name: "PROSPERA", address: process.env.SMTP_USER },
        to: { name, address: email },
        replyTo: { name: "PROSPERA", address: process.env.SMTP_USER },
        subject: "Thank you for contacting PROSPERA",
        text: `Hi ${name},\n\nThank you for getting in touch with PROSPERA. We’ve received your project inquiry and look forward to learning more about your business.\n\nWe aim to reply within 24 hours. If you’d like to add anything, simply reply to this email.\n\nYou can also reach us on WhatsApp: https://wa.me/919372321663\n\nWarm regards,\nPROSPERA\nBuild. Grow. Prosper.\nprosperadigitalstudio315@gmail.com\n+91 93723 21663`,
        headers: { "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All" },
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      confirmationSent = confirmation.accepted.length > 0 && confirmation.rejected.length === 0;
      if (!confirmationSent) console.warn("Contact confirmation was not accepted by the mail server.");
    } catch {
      console.warn("Contact inquiry sent, but confirmation email could not be sent.");
    }
    return Response.json({ ok: true, confirmationSent });
  } catch {
    // Do not expose credentials, SMTP responses, or inquiry contents to clients.
    return reply("We couldn’t send your inquiry. Please try again or use our direct email or WhatsApp link.", 502);
  }
}
