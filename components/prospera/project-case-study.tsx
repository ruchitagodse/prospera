"use client";
/* eslint-disable @next/next/no-img-element -- Existing portfolio media in composed device previews. */

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import type { WorkProject } from "@/content/work";
import { projectStories } from "@/content/work-stories";
import "./project-case-study.css";

export function ProjectCaseStudy({ project, reduced }: { project: WorkProject; reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const id = useId();
  const story = projectStories[project.slug];
  const journeys = story.journeys;
  const journey = journeys[selected];
  const shot = project.screenshots[journey.shot];
  const home = project.screenshots[story.hero[1]];
  const admin = project.screenshots[story.hero[0]];

  useEffect(() => {
    if (reduced || !root.current) return;
    const elements = root.current.querySelectorAll<HTMLElement>("[data-story-reveal]");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gsap.fromTo(entry.target, { opacity: .2, y: 32 }, { opacity: 1, y: 0, duration: .85, ease: "power2.out", clearProps: "opacity,transform" });
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    elements.forEach(element => observer.observe(element));
    return () => { observer.disconnect(); gsap.killTweensOf(Array.from(elements)); };
  }, [reduced]);

  return <div className="p-project-story" ref={root} data-title-length={project.title.length > 30 ? "long" : "short"} style={{ "--story-accent": story.accent, "--story-dark": story.dark } as CSSProperties}>
    <section className="p-story-hero" aria-labelledby="project-story-title">
      <div className="p-case-heading p-story-intro">
        <span className="p-story-eyebrow">{project.industry} / {project.categories.join(" + ")}</span>
        <h1 id="project-story-title" tabIndex={-1}>{project.title}</h1>
        <p className="p-story-lead">{story.lead}</p>
        <p>{project.description}</p>
        <a className="p-story-link" href="#project-walkthrough">Explore the experience <span>↓</span></a>
      </div>
      <div className="p-case-cover p-story-showcase" aria-label={`${project.title} interface previews`} data-main-format={admin.width > admin.height ? "desktop" : "mobile"} data-secondary-format={home.width > home.height ? "desktop" : home.height / home.width < 1.5 ? "compact" : "mobile"}>
        <div className="p-story-orbit" aria-hidden="true"/>
        <div className="p-story-desktop"><div className="p-story-window-bar"><span>{project.title}</span><i/><i/><i/></div><img src={admin.src} alt={admin.alt} width={admin.width} height={admin.height}/></div>
        <div className="p-story-phone"><img src={home.src} alt={home.alt} width={home.width} height={home.height}/></div>
        <span className="p-story-showcase-label">{story.heroLabel} ↗<br/><small>{story.mediaLabel}</small></span>
      </div>
    </section>

    <dl className="p-story-facts" data-story-reveal>
      <div><dt>Project</dt><dd>{project.ownership}</dd></div>
      <div><dt>{project.ownership === "Professional Experience" ? "Role during employment" : "My role"}</dt><dd>End-to-end development</dd></div>
      <div><dt>Technology</dt><dd>{project.technologies.join(" / ")}</dd></div>
      <div><dt>Shown here</dt><dd>{story.mediaLabel}</dd></div>
    </dl>

    <section className="p-story-purpose" data-story-reveal aria-labelledby="project-purpose-title">
      <span className="p-story-eyebrow">01 / The brief</span>
      <h2 id="project-purpose-title">{story.purpose}</h2>
      <div className="p-story-purpose-copy"><p>{project.challenge}</p><p>{story.approach}</p></div>
      <div className="p-story-audiences"><div><span>{story.first.label}</span><p>{story.first.tasks.map(task => <span key={task}>{task}</span>)}</p></div><span aria-hidden="true">↔</span><div><span>{story.second.label}</span><p>{story.second.tasks.map(task => <span key={task}>{task}</span>)}</p></div></div>
    </section>

    <section id="project-walkthrough" className="p-story-walkthrough" data-story-reveal aria-labelledby="project-walkthrough-title">
      <div className="p-story-section-heading"><div><span className="p-story-eyebrow">02 / Explore the product</span><h2 id="project-walkthrough-title">See how it <em>fits together.</em></h2></div><p>Select a workflow to explore the interface.<br/>Visual walkthrough · not a live application.</p></div>
      <div className="p-story-explorer">
        <div className="p-story-tabs" role="tablist" aria-label={`${project.title} workflows`} aria-orientation="vertical" onKeyDown={event => {
          const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
          if (!direction && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? journeys.length - 1 : (selected + direction + journeys.length) % journeys.length;
          setSelected(next); event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
        }}>{journeys.map((item, index) => <button type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} key={item.label} onClick={() => setSelected(index)}><span>0{index + 1}</span><span>{item.label}<small>{item.audience}</small></span><span aria-hidden="true">↗</span></button>)}</div>
        <div className="p-story-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selected}`} tabIndex={0}>
          <div className="p-story-preview" data-format={shot.width > shot.height ? "desktop" : "mobile"} key={shot.src}><img src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} loading="lazy"/><span>{shot.caption}</span></div>
          <div className="p-story-workflow-copy" key={journey.label}><span className="p-story-eyebrow">{journey.audience}</span><h3>{journey.title}</h3><p>{journey.description}</p><ul>{journey.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div>
        </div>
      </div>
    </section>

    <section className="p-story-delivery" data-story-reveal aria-labelledby="project-delivery-title">
      <div><span className="p-story-eyebrow">03 / Behind the experience</span><h2 id="project-delivery-title">Design with purpose.<br/><em>Development with context.</em></h2><p>{project.contribution}</p><ul className="p-story-scope" aria-label="Project scope">{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul><a className="p-story-link" href="#contact">{story.cta} <span>↗</span></a>{project.liveUrl && <a className="p-story-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live website ↗</a>}</div>
      <dl><div><dt>Next.js</dt><dd>Frontend implementation and application workflows.</dd></div><div><dt>Firebase</dt><dd>Firebase integration across the project’s application workflows.</dd></div><div><dt>Meta integrations</dt><dd>Part of the confirmed project stack. Visual previews demonstrate workflows and do not send messages.</dd></div></dl>
    </section>
    <details className="p-story-context"><summary>About this project and its visuals <span>+</span></summary><p>{project.ownership === "Professional Experience" ? "Developed through professional employment. Employer and client ownership is retained; this is not presented as a PROSPERA-owned client engagement." : "An independent PROSPERA project, presented separately from employment work."} {project.mediaNote}</p></details>
  </div>;
}
