import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./wordmark";
import { WebsiteVisits } from "./website-visits";
import "./legal.css";

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <div className="p-legal">
    <a className="p-legal-skip" href="#legal-content">Skip to content</a>
    <header className="p-legal-header">
      <Link href="/" aria-label="PROSPERA home"><Wordmark className="p-legal-wordmark"/></Link>
      <Link href="/contact">Back to contact <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="legal-content" className="p-legal-main">
      <div className="p-legal-intro"><span className="p-legal-eyebrow">PROSPERA / Legal</span><h1>{title}</h1><p>{intro}</p><p className="p-legal-date">Last updated: 3 November 2026</p></div>
      <article className="p-legal-copy" aria-label={title}>{children}</article>
    </main>
    <footer className="p-legal-footer"><span>PROSPERA · Made with care in Mumbai.</span><WebsiteVisits/><nav aria-label="Legal"><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms-of-service">Terms of Service</Link></nav></footer>
  </div>;
}

export function LegalContact() {
  return <p>Contact PROSPERA in Mumbai, India at <a href="mailto:prosperadigitalstudio315@gmail.com">prosperadigitalstudio315@gmail.com</a> or <a href="tel:+919372321663">+91 93723 21663</a>.</p>;
}
