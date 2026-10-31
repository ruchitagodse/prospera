import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Exercise the actual route with an in-memory mail transport; never sends mail.
const route = await readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8");
const scopeSource = await readFile(new URL("../content/contact.ts", import.meta.url), "utf8");
const source = route
  .replace('import { contactScopes } from "@/content/contact";', scopeSource)
  .replace('import { createContactTransport } from "@/lib/contact-mail.mjs";', `
    export const deliveries = [];
    export let failConfirmation = false;
    export function setConfirmationFailure() { failConfirmation = true; }
    const createContactTransport = () => ({ sendMail: async mail => {
      if (failConfirmation && mail.subject === "Thank you for contacting PROSPERA") throw new Error("test");
      deliveries.push(mail); return { accepted: [mail.to], rejected: [] };
    }});
  `);
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const handler = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const original = Object.fromEntries(["SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO_EMAIL"].map(key => [key, process.env[key]]));
const valid = { name: "Test", business: "Example", email: "test@example.com", whatsapp: "+91 90000 00000", budget: "INR 50,000", scopes: ["Business Solutions"], message: "A dashboard enquiry.", website: "" };
let requestId = 0;
const submit = (body, options = {}) => handler.POST(new Request("http://localhost/api/contact", {
  method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `test-${requestId++}`, ...options }, body: JSON.stringify(body),
}));
try {
  for (const key of Object.keys(original)) delete process.env[key];
  assert.equal((await submit({ ...valid, business: "" })).status, 400);
  assert.equal((await submit({ ...valid, whatsapp: "......." })).status, 400);
  assert.equal((await submit({ ...valid, budget: "x".repeat(121) })).status, 400);
  assert.equal((await submit({ ...valid, scopes: [] })).status, 400);
  assert.equal((await submit({ ...valid, scopes: ["Unknown"] })).status, 400);
  assert.equal((await submit({ ...valid, website: "spam" })).status, 400);
  assert.equal((await submit(valid, { origin: "https://other.example" })).status, 403);
  assert.equal((await submit(valid)).status, 503);
  process.env.SMTP_USER = "studio@example.com";
  process.env.SMTP_PASSWORD = "test-only";
  process.env.CONTACT_TO_EMAIL = "studio@example.com";
  assert.deepEqual(await (await submit(valid)).json(), { ok: true, confirmationSent: true });
  const mail = handler.deliveries[0].text;
  for (const field of [valid.business, valid.whatsapp, valid.budget, valid.scopes[0], valid.message]) assert.ok(mail.includes(field));
  assert.deepEqual(await (await submit({ ...valid, budget: "" })).json(), { ok: true, confirmationSent: true });
  handler.setConfirmationFailure();
  assert.deepEqual(await (await submit(valid)).json(), { ok: true, confirmationSent: false });
  console.log("Contact checks passed: validation, origin protection, unavailable mail, all enquiry fields, optional budget, and confirmation failure.");
} finally {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
