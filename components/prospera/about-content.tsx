import { AboutSpotlight } from "./about-spotlight";
import { WorkProcess } from "./work-process";

export function AboutContent({ active, reduced }: { active: boolean; reduced: boolean }) {
  return <div className="p-about p-about-scene"><AboutSpotlight active={active} reduced={reduced}/>
    <section className="p-founder-editorial" aria-labelledby="founder-heading">
      <figure className="p-founder-portrait"><span aria-hidden="true">RG</span><figcaption>Ruchita · Founder, PROSPERA<br/><small>Founder photograph to be added</small></figcaption></figure>
      <div><span className="p-editorial-index">A personal approach</span><h2 id="founder-heading">The Person Behind <em>PROSPERA.</em></h2><p>I’m Ruchita, founder of PROSPERA.</p><p>I believe technology should make business simpler, not more complicated. With a background in software development and a passion for design, I bring both worlds together to create meaningful digital solutions.</p><p>From the first conversation to the final delivery, I work closely with businesses to turn their ideas into something useful, thoughtful and impactful.</p><a className="p-editorial-link" href="#contact">Let’s talk about your business <span>↗</span></a></div>
    </section>
    <WorkProcess active={active} reduced={reduced}/>
  </div>;
}
