"use client";

import { FormEvent, useId, useState } from "react";

const scopes = [
  "Strategy & positioning",
  "Brand identity",
  "Website or web app",
  "E-commerce",
  "Content & campaigns",
  "Ongoing digital support",
  "Not sure yet",
];

type Audience = "client" | "email";

function SocialIcon({ type }: { type: "instagram" | "whatsapp" | "email" }) {
  if (type === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r=".8" className="p-social-dot"/></svg>;
  if (type === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 4.7A10 10 0 0 0 3.8 16.8L3 21l4.3-1.1A10 10 0 1 0 19.5 4.7Z"/><path d="M8.4 7.8c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.9 2.1c.1.3 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.1 2.8 2.8l.6-.5c.2-.1.5-.2.7-.1l2.1.9c.3.1.4.3.4.5v.5c0 .3-.1.5-.5.7-.5.2-1.6.4-3-.2-1.2-.5-2.7-1.7-3.7-3.5-.9-1.6-1.2-3-.5-3.4Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>;
}

export function ContactInquiry() {
  const [audience, setAudience] = useState<Audience>("client");
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [missing, setMissing] = useState(false);
  const scopeId = useId();

  const toggleScope = (scope: string) => {
    setSelected((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) { setMissing(true); return; }
    setMissing(false);
    setSent(true);
  };

  return <section className="p-inquiry" aria-labelledby="contact-title">
    <div className="p-inquiry-panel">
    <div className="p-inquiry-top"><span className="p-inquiry-index">04 / Contact</span>
      <div className="p-inquiry-tabs" role="tablist" aria-label="Contact type">
        {(["client", "email"] as Audience[]).map((item) => <button key={item} role="tab" aria-selected={audience === item} className={audience === item ? "is-active" : ""} onClick={() => { setAudience(item); setSent(false); }}>
          {item === "client" ? "Client" : "Email"}
        </button>)}
      </div>
      <a className="p-inquiry-close" href="#home">Close <span>×</span></a>
    </div>

    <div className="p-inquiry-intro">
      <h1 id="contact-title">Let’s build<br/>together.</h1>
      <div className="p-inquiry-aside">
        <p>{audience === "client" ? "Tell us what you’re making. We’ll get in touch with the right next step." : "Prefer a direct note? Share the essentials and we’ll make it easy to continue the conversation."}</p>
        <p className="p-inquiry-response">We reply within two business days.</p>
        <div className="p-inquiry-direct"><span>Or reach us directly</span><div>
          <a href="https://www.instagram.com/prospera___/" target="_blank" rel="noreferrer" aria-label="PROSPERA on Instagram"><SocialIcon type="instagram"/></a>
          <a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="Contact PROSPERA on WhatsApp"><SocialIcon type="whatsapp"/></a>
          <a href="mailto:" aria-label="Email PROSPERA"><SocialIcon type="email"/></a>
        </div></div>
      </div>
    </div>

    {sent ? <div className="p-inquiry-thanks" role="status"><span>Inquiry prepared</span><h2>Thank you.<br/><em>We’ll be in touch.</em></h2><button onClick={() => setSent(false)}>Send another inquiry <span>↗</span></button></div> : <form className="p-inquiry-form" noValidate onInput={() => setMissing(false)} onSubmit={submit}>
      <div className="p-inquiry-prompt"><p>{audience === "client" ? "Tell us about your project and we’ll get in touch." : "Leave your details and a note for the team."}</p><span>01. Scope</span></div>
      <fieldset className="p-scope-fieldset">
        <legend className="p-sr-only">What can we help with?</legend>
        {scopes.map((scope) => <label key={scope} htmlFor={`${scopeId}-${scope}`} className={selected.includes(scope) ? "is-selected" : ""}>
          <input id={`${scopeId}-${scope}`} type="checkbox" checked={selected.includes(scope)} onChange={() => toggleScope(scope)}/><i aria-hidden="true"/>{scope}
        </label>)}
      </fieldset>
      <div className="p-inquiry-details">
        <label>Name<input name="name" required autoComplete="name" placeholder="Your name"/></label>
        <label>Email<input name="email" required type="email" autoComplete="email" placeholder="you@company.com"/></label>
        <label className="p-inquiry-message">A few words<textarea name="message" required rows={3} placeholder="What would you like to make?"/></label>
        {missing && <p className="p-inquiry-validation" role="alert">Please add your name, email, and a short message to continue.</p>}
        <button className="p-inquiry-submit" type="submit">Start the conversation <span>↗</span></button>
      </div>
    </form>}
    <div className="p-footer-bottom"><span>PROSPERA Digital Solutions</span><span>Made with care in Mumbai.</span><a href="#home">Back to top ↑</a></div>
    </div>
  </section>;
}
