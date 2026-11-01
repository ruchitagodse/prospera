"use client";

import { useRef } from "react";
import { useAboutMotion } from "./about-motion";
import { AboutSpotlight } from "./about-spotlight";
import "./about-story.css";

const principles = [
  { number: "01", title: "Understand the everyday.", text: "The spreadsheet you update twice. The enquiry that gets lost. The website that no longer feels like you. That’s where we start." },
  { number: "02", title: "Make the pieces connect.", text: "Your brand, website and business tools should feel like parts of the same business. We consider how they work together, from the first impression to the daily workflow." },
  { number: "03", title: "Keep it useful.", text: "A clear next step for your customers. Less repetitive work for your team. Design decisions should earn their place by making something easier." },
];
const process = [
  { title: "First, we listen.", short: "Your business before the brief.", text: "We talk through what you do, who you serve and what’s getting in the way. Together, we define the problem, the priorities and what a useful outcome looks like.", outcome: "A shared direction" },
  { title: "Then, we give it shape.", short: "Something you can see and respond to.", text: "We map the journey and explore the structure, content and visual direction. You can respond to the idea while it’s still easy to refine, before it becomes a finished product.", outcome: "A clear plan and design direction" },
  { title: "We build with purpose.", short: "The details meet the real world.", text: "The design becomes a working website, application or business tool. We review the details together and check how the experience works across the screens and tasks that matter.", outcome: "A working solution, ready for review" },
  { title: "And plan what’s next.", short: "A considered handover.", text: "We walk through what’s been built, how to use it and what to keep in mind after launch. If you need further improvements or support, we can agree on the next steps together.", outcome: "Clarity for launch and beyond" },
];
export function AboutContent({ active, reduced }: { active: boolean; reduced: boolean }) {
  const narrative = useRef<HTMLDivElement>(null);
  useAboutMotion(narrative, active, reduced);
  return <div className="p-about p-about-scene">
    <AboutSpotlight active={active} reduced={reduced}/>
    <div className="p-about-narrative" ref={narrative}>
      <section className="p-studio-note" aria-labelledby="studio-note-heading">
        <div className="p-note-top"><span className="p-story-label">A note from the studio</span><span aria-hidden="true">↓ &nbsp; Behind the work</span></div>
        <h2 id="studio-note-heading">Good design should<br/>do more than <em>look good.</em></h2>
        <div className="p-note-bottom"><span className="p-note-asterisk" aria-hidden="true">✳</span><p>It should help someone find you, understand you, or get through their day with a little less friction. That’s the kind of work we’re here to make.</p></div>
      </section>
      <section className="p-story-founder" aria-labelledby="studio-founder-heading">
        <div className="p-founder-sleeve" role="img" aria-label="Ruchita’s studio monogram, connecting design and development">
          <div className="p-sleeve-top"><span>PROSPERA / STUDIO NOTES</span><span>01</span></div>
          <div className="p-founder-record" aria-hidden="true"><span>RG</span><i/></div>
          <div className="p-sleeve-bottom"><span>Design intuition.<br/>Developer thinking.</span><span className="p-sleeve-mark" aria-hidden="true">↗</span></div>
        </div>
        <div className="p-story-founder-copy"><span className="p-story-label">The person behind the studio</span><h2 id="studio-founder-heading">Hi, I’m Ruchita.<br/><em>I connect the dots.</em></h2>
          <p className="p-story-lead">Between how your business looks.<br/>And how it actually works.</p>
          <p>My background is in software development; my passion is design. PROSPERA brings those two sides together, so a website can feel right and a business tool can make sense to the people using it.</p>
          <p>I work closely with you, from understanding the first idea to refining the details. The starting point is always your business: what you need, what feels complicated and where you want to go.</p>
          <div className="p-founder-signoff"><span>Ruchita</span><small>Founder, PROSPERA<br/>Mumbai, India</small></div>
        </div>
      </section>
      <section className="p-studio-principles" aria-labelledby="studio-principles-heading">
        <div className="p-story-section-head"><span className="p-story-label">The thinking behind the making</span><h2 id="studio-principles-heading">Small details.<br/><em>Real purpose.</em></h2><a href="#work" className="p-story-link">Explore the work <span>↗</span></a></div>
        <div className="p-principle-list">{principles.map(item => <article key={item.number}><span className="p-principle-number">{item.number} /</span><div><h3>{item.title}</h3><p>{item.text}</p></div><span className="p-principle-symbol" aria-hidden="true">{item.number === "01" ? "↳" : item.number === "02" ? "∞" : "✳"}</span></article>)}</div>
      </section>
      <section className="p-studio-process" aria-labelledby="studio-process-heading">
        <div className="p-story-section-head"><span className="p-story-label">Working together</span><h2 id="studio-process-heading">A conversation.<br/>Then, <em>a way forward.</em></h2><p>You bring the context. We bring design and technology. Here’s how we turn that into a shared direction.</p></div>
        <div className="p-process-sessions">{process.map((step, index) => <details key={step.title} name="studio-process" open={index === 0}><summary><span className="p-session-number">0{index + 1}</span><span className="p-session-title">{step.title}<small>{step.short}</small></span><span className="p-session-toggle" aria-hidden="true"/></summary><div className="p-session-body"><p>{step.text}</p><span><i aria-hidden="true">↳</i> {step.outcome}</span></div></details>)}</div>
      </section>
      <section className="p-studio-invitation" aria-labelledby="studio-invitation-heading"><span className="p-story-label">Your next chapter</span><h2 id="studio-invitation-heading">What could work<br/><em>better for you?</em></h2><div><p>A new idea, an outdated website, a process that takes too long. Let’s start there.</p><a href="#contact" className="p-invitation-cta">Tell us what’s on your mind <span>↗</span></a></div><footer><span>PROSPERA · Design & digital solutions</span><span>Build. Grow. Prosper.</span></footer></section>
    </div>
  </div>;
}
