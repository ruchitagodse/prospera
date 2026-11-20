import { websiteVisits } from "@/lib/website-visits";

const headers = { "Cache-Control": "private, no-store" };
const unavailable = () => Response.json({ total: null }, { status: 503, headers });

export async function GET() {
  try {
    return Response.json({ total: await websiteVisits() }, { headers });
  } catch { return unavailable(); }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ error: "This request is not allowed." }, { status: 403, headers });
  }
  const session = request.headers.get("x-visit-session") || "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session)) {
    return Response.json({ error: "Invalid visit session." }, { status: 400, headers });
  }
  // Preview builds and local development must not inflate the public total.
  const production = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  const bot = /bot|crawler|spider|headless|lighthouse|prerender/i.test(request.headers.get("user-agent") || "");
  try {
    return Response.json({ total: await websiteVisits(production && !bot ? session : undefined) }, { headers });
  } catch { return unavailable(); }
}
