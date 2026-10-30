"use client";

import { useEffect, useRef, useState } from "react";
import { serviceOfferings } from "@/content/site";
import type { RibbonController } from "@/lib/services-ribbon";
import "./services.css";

const codes = ["WEB DEV", "APP / CRM", "WRK FLOW", "E / COMM", "DIG DSGN"];
const slogans = ["Make an impact.", "All in sync.", "Less repeat.", "Open for business.", "Be seen."];

export function ServicesContent({ active = false, reduced = false }: { active?: boolean; reduced?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<RibbonController | null>(null);
  const progress = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLButtonElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const detailArt = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [grid, setGrid] = useState(false);

  useEffect(() => {
    let disposed = false;
    import("@/lib/service-poster").then(({ createServicePoster }) => {
      if (disposed || !host.current) return;
      serviceOfferings.forEach((_, index) => {
        const artwork = createServicePoster(index);
        host.current?.querySelectorAll<HTMLElement>(`.p-ribbon-slot[data-service="${index}"] .p-ribbon-fallback`).forEach(fallback => {
          fallback.style.backgroundImage = `url(${artwork.image})`;
          fallback.dataset.poster = "true";
        });
        artwork.texture.dispose();
      });
    });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || !active || grid) return;
    let disposed = false;
    import("@/lib/services-ribbon").then(({ createServicesRibbon }) => {
      if (disposed) return;
      try {
        controller.current = createServicesRibbon(el, Array.from(el.querySelectorAll<HTMLElement>(".p-ribbon-slot")), reduced, value => { if (progress.current) progress.current.style.setProperty("--position", `${value * 100}%`); });
        el.dataset.ready = "true";
      } catch { el.dataset.ready = "false"; }
    });
    return () => { disposed = true; controller.current?.dispose(); controller.current = null; delete el.dataset.ready; };
  }, [active, reduced, grid]);

  useEffect(() => {
    if (selected === null) return;
    close.current?.focus();
  }, [selected]);
  useEffect(() => {
    const canvas = detailArt.current;
    if (selected === null || !canvas) return;
    let disposed = false;
    let frame = 0;
    let release = () => {};
    import("@/lib/services-ribbon").then(({ createServicePoster }) => {
      if (disposed) return;
      const artwork = createServicePoster(selected);
      const context = canvas.getContext("2d");
      release = () => artwork.texture.dispose();
      let previous = 0;
      const draw = (time: number) => {
        if (disposed) return;
        if (time - previous > 40 || reduced) {
          artwork.draw(reduced ? 0 : time * .001);
          context?.drawImage(artwork.canvas, 0, 105, 512, 480, 0, 0, 512, 480);
          previous = time;
        }
        if (!reduced) frame = requestAnimationFrame(draw);
      };
      draw(0);
    });
    return () => { disposed = true; cancelAnimationFrame(frame); release(); };
  }, [selected, reduced]);
  const dismiss = () => { setSelected(null); requestAnimationFrame(() => previousFocus.current?.focus({ preventScroll: true })); };
  const service = selected === null ? null : serviceOfferings[selected];

  return <div className="p-services-view" data-layout={grid ? "grid" : "ribbon"}>
    <div className="p-services-toolbar"><h1 tabIndex={-1}>Services</h1><div><button aria-pressed={!grid} onClick={() => setGrid(false)}>Ribbon</button><span>/</span><button aria-pressed={grid} onClick={() => setGrid(true)}>Grid</button></div><a href="#contact">Let’s talk ↗</a></div>
    <div ref={host} className="p-services-ribbon" aria-label="Service gallery. Drag or scroll to explore." data-lenis-prevent="true" onKeyDown={event => { if (selected !== null) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); controller.current?.move(event.key === "ArrowRight" ? 1 : -1); } }}>
      {Array.from({ length: 15 }, (_, slot) => { const index = slot % 5, service = serviceOfferings[index], duplicate = slot < 5 || slot > 9;
        return <article className="p-ribbon-slot" data-service={index} key={slot} aria-hidden={duplicate}>
          <span className="p-ribbon-label">{service.name}<span>{service.number}</span></span>
          <button className="p-ribbon-hitbox" tabIndex={duplicate ? -1 : 0} aria-label={`Explore ${service.name}`} aria-haspopup="dialog" onFocus={event => { if (event.currentTarget.matches(":focus-visible")) controller.current?.focus(slot); }} onClick={event => { previousFocus.current = event.currentTarget; setSelected(index); }}>
            <span className="p-ribbon-fallback"><small>PROSPERA / DIGITAL STUDIO</small><b>{service.name}</b><span>{service.name} ↗</span></span><span className="p-ribbon-accessible">{service.name}</span>
          </button>
        </article>;
      })}
    </div>
    <div className="p-services-cube" aria-hidden="true"><div>{["P", "+", "↗", "P", "+", "↗"].map((face,index) => <span key={index}>{face}</span>)}</div></div>
    <div className="p-services-footer"><span>PROSPERA <span>EXPERTISE HUB</span></span><p>Websites. Business tools. Automation. Design.</p><span>Drag / Scroll / Click to flip</span></div>
    <div className="p-ribbon-navigation"><button aria-label="Previous service" onClick={() => controller.current?.move(-1)}>←</button><div ref={progress} className="p-ribbon-progress" aria-hidden="true"><i/></div><button aria-label="Next service" onClick={() => controller.current?.move(1)}>→</button></div>
    {service && <div className="p-service-detail-shade" onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="p-service-detail-title" className="p-service-detail" data-service={selected} data-lenis-prevent="true" onKeyDown={event => { if (event.key === "Escape") dismiss(); if (event.key === "Tab") { const elements=event.currentTarget.querySelectorAll<HTMLElement>("button,a");const first=elements[0],last=elements[elements.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();} } }}>
        <div className="p-service-detail-top"><button ref={close} onClick={dismiss} aria-label="Close service details">CLS <span>×</span></button><span>{codes[selected!]} / {service.number}</span><span>PROSPERA</span></div>
        <div className="p-service-detail-layout"><div className="p-service-detail-art" aria-hidden="true"><canvas ref={detailArt} width={512} height={480}/></div>
          <div className="p-service-detail-copy"><span className="p-service-detail-eyebrow">{slogans[selected!]}</span><h2 id="p-service-detail-title">{service.name}</h2><p>{service.description}</p><ul>{service.includes.map((item,index) => <li key={item}><span>0{index+1}</span>{item}</li>)}</ul><a href="#contact" onClick={() => setSelected(null)}>Discuss this service <span>↗</span></a></div>
        </div><div className="p-service-detail-bottom"><span>PROSPERA / EXPERTISE HUB</span><span>BUILT AROUND YOUR BUSINESS ↗</span></div>
      </div>
    </div>}
  </div>;
}
