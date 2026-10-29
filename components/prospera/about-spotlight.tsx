"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AboutSpotlight({ active, reduced }: { active: boolean; reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const surface = root.current;
    if (!active || !surface || reduced) return;
    const light = { x: 60, y: 38, tx: 60, ty: 38, inside: false };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = surface.getBoundingClientRect();
      light.tx = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
      light.ty = Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
      light.inside = true;
    };
    const leave = () => { light.inside = false; };
    const tick = (time: number, delta: number) => {
      const bounds = surface.getBoundingClientRect();
      if (document.hidden || surface.closest<HTMLElement>(".prospera")?.dataset.overlay === "true" || bounds.width === 0 || bounds.bottom < 0 || bounds.top > innerHeight) return;
      if (!light.inside) { light.tx = 55 + Math.sin(time * .28) * 24; light.ty = 42 + Math.cos(time * .23) * 18; }
      const follow = 1 - Math.exp(-Math.min(delta, 40) / 180);
      light.x += (light.tx - light.x) * follow; light.y += (light.ty - light.y) * follow;
      surface.style.setProperty("--light-x", `${light.x}%`);
      surface.style.setProperty("--light-y", `${light.y}%`);
      surface.style.setProperty("--shade-x", `${(50 - light.x) * .1}px`);
      surface.style.setProperty("--shade-y", `${(50 - light.y) * .12 + 4}px`);
      surface.querySelectorAll<HTMLElement>(".p-about-relief").forEach(relief => {
        const outer = surface.getBoundingClientRect(), inner = relief.getBoundingClientRect();
        relief.style.setProperty("--beam-x", `${light.x / 100 * outer.width - (inner.left - outer.left)}px`);
        relief.style.setProperty("--beam-y", `${light.y / 100 * outer.height - (inner.top - outer.top)}px`);
        const words = relief.querySelector<HTMLElement>(".p-relief-words");
        if (words) {
          const bounds = words.getBoundingClientRect();
          words.style.setProperty("--beam-x", `${light.x / 100 * outer.width - (bounds.left - outer.left)}px`);
          words.style.setProperty("--beam-y", `${light.y / 100 * outer.height - (bounds.top - outer.top)}px`);
        }
      });
      surface.querySelectorAll<HTMLElement>(".p-about-scene-panel").forEach(panel => {
        const card = panel.getBoundingClientRect();
        panel.style.setProperty("--card-light-x", `${light.x / 100 * bounds.width - (card.left - bounds.left)}px`);
        panel.style.setProperty("--card-light-y", `${light.y / 100 * bounds.height - (card.top - bounds.top)}px`);
      });
    };
    surface.addEventListener("pointermove", move); surface.addEventListener("pointerleave", leave);
    gsap.ticker.add(tick);
    const tweens: gsap.core.Tween[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tweens.push(gsap.fromTo(entry.target, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power2.out", clearProps: "transform,opacity" }));
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    const blocks = surface.querySelectorAll<HTMLElement>(".p-about-scene-panel");
    blocks?.forEach(el => observer.observe(el));
    return () => {
      observer.disconnect(); tweens.forEach(tween => tween.kill());
      blocks?.forEach(el => { el.style.removeProperty("transform"); el.style.removeProperty("opacity"); });
      gsap.ticker.remove(tick); surface.removeEventListener("pointermove", move); surface.removeEventListener("pointerleave", leave);
      ["--light-x", "--light-y", "--shade-x", "--shade-y"].forEach(name => surface.style.removeProperty(name));
      surface.querySelectorAll<HTMLElement>(".p-about-relief,.p-relief-words").forEach(el => { el.style.removeProperty("--beam-x"); el.style.removeProperty("--beam-y"); });
      surface.querySelectorAll<HTMLElement>(".p-about-scene-panel").forEach(el => { el.style.removeProperty("--card-light-x"); el.style.removeProperty("--card-light-y"); });
    };
  }, [active, reduced]);

  return <div className="p-about-light p-about-scene-stage" ref={root}>
    <div className="p-about-scene-top"><span className="p-section-label">02 / ABOUT PROSPERA</span><span>MUMBAI, INDIA</span></div>
    <div className="p-about-scene-intro"><h1 tabIndex={-1}>A little care.<br/><em>A lot of possibility.</em></h1><a href="#contact">Let’s talk <span>↗</span></a></div>
    <div className="p-about-scene-trio" id="about-purpose">
      <section className="p-about-scene-panel"><div className="p-about-relief p-purpose-sculpture" aria-hidden="true"><svg viewBox="0 0 320 300" fill="none"><path d="M15 55C160 55 105 150 215 150M15 150H215M15 245C160 245 105 150 215 150"/><path className="p-scene-arrow" d="M215 150H305m-22-22 22 22-22 22"/><circle cx="215" cy="150" r="10"/></svg></div><div className="p-scene-panel-copy"><span>01 / THE PURPOSE</span><h2>Less friction.</h2><p>Making the digital side<br/>of business easier.</p></div></section>
      <section className="p-about-scene-panel p-about-scene-vision"><div className="p-about-relief p-vision-sculpture"><div className="p-relief-words" aria-label="Build. Grow. Prosper."><span>Build.</span><span>Grow.</span><span>Prosper.</span></div></div><div className="p-scene-panel-copy"><span>02 / THE VISION</span><h2>Room to grow.</h2><p>A strong start.<br/>A lasting difference.</p></div></section>
      <section className="p-about-scene-panel"><div className="p-about-relief p-person-sculpture" aria-hidden="true"><div className="p-scene-ring"/><div className="p-relief-words"><span>RG</span></div></div><div className="p-scene-panel-copy"><span>03 / THE PERSON</span><h2>Ruchita Godse</h2><p>Founder · PROSPERA<br/>Personal by design.</p></div></section>
    </div>
    <div className="p-about-scene-bottom"><span>DIGITAL STUDIO</span><span>CLARITY. CARE. A WAY FORWARD.</span></div>
  </div>;
}
