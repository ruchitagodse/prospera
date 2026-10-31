"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { contactScopes as scopes } from "@/content/contact";

function SocialIcon({ type }: { type: "instagram" | "whatsapp" | "email" }) {
  if (type === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r=".8" className="p-social-dot"/></svg>;
  if (type === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true" style={{width:22,height:22,strokeWidth:1.25}}>
    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.8Z"/>
    <path transform="translate(2.4 2.4) scale(.8)" style={{stroke:"none",fill:"currentColor"}} d="M8.1 7c-.3 0-.6.1-.8.4-.4.4-.7 1-.7 1.8 0 1.1.7 2.3 1.7 3.5 1.4 1.7 3.2 2.8 5.1 3.3 1 .3 1.8.1 2.4-.3.4-.3.7-.8.8-1.4 0-.2-.1-.3-.3-.4l-2.1-1c-.2-.1-.4-.1-.5.1l-.9 1c-.1.1-.3.2-.5.1-1.5-.6-2.7-1.7-3.3-3-.1-.2-.1-.3.1-.5l.6-.7c.2-.2.2-.4.1-.6L9 7.4C8.9 7.1 8.7 7 8.5 7Z"/>
  </svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>;
}

export function ContactInquiry() {
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const scopeId = useId();
  const sheet=useRef<HTMLElement>(null);
  useEffect(() => {
    const chooseService = (event: Event) => {
      const service = (event as CustomEvent<string>).detail;
      if (scopes.includes(service)) { setSelected([service]); setSent(false); }
    };
    window.addEventListener("prospera:service", chooseService);
    return () => window.removeEventListener("prospera:service", chooseService);
  }, []);

  const toggleScope = (scope: string) => {
    setSelected((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!event.currentTarget.reportValidity() || selected.length === 0) { setMissing(true); return; }
    setMissing(false);
    const values = new FormData(event.currentTarget);
    setSending(true); setSendError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.get("name"), business: values.get("business"), email: values.get("email"), whatsapp: values.get("whatsapp"), budget: values.get("budget"), message: values.get("message"), website: values.get("website"), scopes: selected }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "We couldn’t send your inquiry. Please try again.");
      setConfirmationSent(result.confirmationSent === true);
      setSelected([]); setSent(true);
    } catch (error) {
      setSendError(error instanceof Error && error.name !== "TimeoutError" && error.name !== "TypeError" ? error.message : "We couldn’t confirm your inquiry was sent. Please try again or contact us directly.");
    } finally { setSending(false); }
  };

  return <section ref={sheet} className="p-inquiry" aria-labelledby="contact-title" data-lenis-prevent="true">
    <div className="p-inquiry-panel">
    <div className="p-inquiry-top"><span className="p-inquiry-index">05 / Contact</span>
      <a className="p-inquiry-email" href="mailto:prosperadigitalstudio315@gmail.com">prosperadigitalstudio315@gmail.com</a>
      <a className="p-inquiry-close" href="#home">Close <span>×</span></a>
    </div>

    <div className="p-inquiry-intro">
      <h1 id="contact-title">Let’s Build Something That Moves Your Business <em>Forward.</em></h1>
      <div className="p-inquiry-aside">
        <p>Tell us about your project and we’ll get in touch.</p>
        <p className="p-inquiry-response">We aim to reply within 24 hours.</p>
        <a className="p-whatsapp-cta" href="https://wa.me/919372321663?text=Hello%20PROSPERA%2C%20I%27d%20like%20to%20discuss%20a%20project." target="_blank" rel="noreferrer">Let’s chat on WhatsApp <span>↗</span></a>
        <div className="p-inquiry-direct"><span>Or reach us directly</span><div>
          <a href="https://www.instagram.com/prospera____/" target="_blank" rel="noreferrer" aria-label="Instagram: @prospera____" title="@prospera____"><SocialIcon type="instagram"/></a>
          <a href="https://wa.me/919372321663" target="_blank" rel="noreferrer" aria-label="Contact PROSPERA on WhatsApp"><SocialIcon type="whatsapp"/></a>
          <a href="mailto:prosperadigitalstudio315@gmail.com" aria-label="Email PROSPERA"><SocialIcon type="email"/></a>
        </div><address className="p-inquiry-address"><a href="mailto:prosperadigitalstudio315@gmail.com">prosperadigitalstudio315@gmail.com</a><a href="tel:+919372321663">+91 93723 21663</a></address></div>
      </div>
    </div>

    {sent ? <div className="p-inquiry-thanks" role="status"><span>Inquiry sent</span><h2>Thank you.<br/><em>We’ll be in touch.</em></h2>{confirmationSent && <p>We’ve also sent a thank-you email. Please check your inbox or spam folder.</p>}<button onClick={() => setSent(false)}>Send another inquiry <span>↗</span></button></div> : <form className="p-inquiry-form" aria-busy={sending} noValidate onInput={() => setMissing(false)} onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{display:"none"}}/>
      <div className="p-inquiry-prompt"><span>01. Service required · Choose one or more</span></div>
      <fieldset className="p-scope-fieldset">
        <legend className="p-sr-only">What can we help with?</legend>
        {scopes.map((scope) => <label key={scope} htmlFor={`${scopeId}-${scope}`} className={selected.includes(scope) ? "is-selected" : ""}>
          <input id={`${scopeId}-${scope}`} type="checkbox" checked={selected.includes(scope)} onChange={() => toggleScope(scope)}/><i aria-hidden="true"/>{scope}
        </label>)}
      </fieldset>
      <div className="p-inquiry-details">
        <label>Name<input name="name" required maxLength={120} autoComplete="name" placeholder="Your name"/></label>
        <label>Business name<input name="business" required maxLength={160} autoComplete="organization" placeholder="Your business"/></label>
        <label>Email<input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="you@company.com"/></label>
        <label>WhatsApp number<input name="whatsapp" required type="tel" inputMode="tel" maxLength={30} minLength={7} pattern="[+0-9() .\-]{7,30}" autoComplete="tel" placeholder="Include your country code"/></label>
        <label className="p-inquiry-message">Budget <span>(optional)</span><input name="budget" maxLength={120} placeholder="Your range and currency, if known"/></label>
        <label className="p-inquiry-message">Tell us about your project<textarea name="message" required maxLength={5000} rows={3} placeholder="What would you like to make?"/></label>
        {missing && <p className="p-inquiry-validation" role="alert">Please complete the required fields and choose at least one service. Choose “Not sure yet” if you need help deciding.</p>}
        {sendError && <p className="p-inquiry-validation" role="alert">{sendError}</p>}
        <button className="p-inquiry-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Start the conversation"} <span>↗</span></button>
      </div>
    </form>}
    <div className="p-footer-bottom"><span>PROSPERA</span><span>Made with care in Mumbai.</span><button type="button" onClick={()=>sheet.current?.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>Back to top ↑</button></div>
    </div>
  </section>;
}
