"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { assembleLoader, revealExperience } from "@/lib/opening-sequence";
import { motion } from "@/config/motion";
import { startMotion } from "@/lib/motion-engine";
import { enableSound, playTone as tone } from "@/lib/sound";
import { usePreferences } from "@/store/use-preferences";
import { headline } from "@/content/site";
import { GalleryMenu, pages, type PageId } from "./gallery-menu";
import { AboutContent } from "./about-content";
import { WorkExperience } from "./work-experience";
import { ContactInquiry } from "./contact-inquiry";
import "./experience.css";
import "./typography.css";
import "./about-scene.css";
import { logoInkPath, logoGoldPath, logoViewBox } from "./logo-geometry";


const emblemPath = (d: string) => (d.match(/M[^M]+/g) ?? []).filter(part => Number(part.match(/^M[\d.-]+[ ,]+([\d.-]+)/)?.[1]) < 420).join("");

function Mark({ className = "", wordmark = false, assembly = false, emblem = false }: { className?: string; wordmark?: boolean; assembly?: boolean; emblem?: boolean }) {
  const id = useId().replaceAll(":", "");
  return <svg className={className} viewBox={wordmark ? "60 425 630 90" : emblem ? "230 200 290 225" : logoViewBox} fill="none" aria-hidden="true">
    <defs><linearGradient id={id} x1="235" y1="410" x2="505" y2="225" gradientUnits="userSpaceOnUse"><stop stopColor="#98733f"/><stop offset=".55" stopColor="#dfc18d"/><stop offset="1" stopColor="#b18c51"/></linearGradient></defs>
    {assembly ? <>
      <defs>
        <g id={id + "-art"}><path fill="currentColor" fillRule="evenodd" d={emblem ? emblemPath(logoInkPath) : logoInkPath}/><path fill={`url(#${id})`} fillRule="evenodd" d={emblem ? emblemPath(logoGoldPath) : logoGoldPath}/></g>
        <clipPath id={id + "-silhouette"}><path clipRule="evenodd" d={logoInkPath}/><path clipRule="evenodd" d={logoGoldPath}/></clipPath>
        <linearGradient id={id + "-shine"}><stop stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="#fff1c5" stopOpacity=".9"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
        {Array.from({length:8},(_,i)=><clipPath key={i} id={id+"-slice-"+i}><rect x={60+i*79} y="190" width="79.5" height="380"/></clipPath>)}
      </defs>
      {Array.from({length:8},(_,i)=><g key={i} clipPath={`url(#${id}-slice-${i})`}><g data-logo-piece=""><use href={"#"+id+"-art"}/></g></g>)}
      <g clipPath={`url(#${id}-silhouette)`}><rect className="p-logo-shimmer" x="150" y="190" width="160" height="380" fill={`url(#${id}-shine)`}/></g>
    </> : <><path fill="currentColor" fillRule="evenodd" d={logoInkPath}/><path fill={`url(#${id})`} fillRule="evenodd" d={logoGoldPath}/></>}

  </svg>;
}

export default function ExperienceShell({ initialPage = "home", initialProject = null }: { initialPage?: PageId; initialProject?: string | null }) {
  const { theme, setTheme, sound, setSound, reduced, setReduced, systemReduced } = usePreferences();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const entryLock = useRef(false);
  const counter = useRef<HTMLSpanElement>(null);
  const [panel, setPanel] = useState<"menu" | "settings" | null>(null);
  const [page, setPage] = useState<PageId>(initialPage);
  const [menuSnapshot, setMenuSnapshot] = useState<string | null>(null);
  const snapshotSize = useRef("");
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const overlay = useRef<HTMLDialogElement>(null);
  const scene = useRef<ReturnType<typeof import("@/lib/logo-scene").createScene>>(null);
  const closeMenu = useCallback(() => setPanel(null), []);
  const navigate = useCallback((next: PageId) => {
    setPage(next);
    const href = next === "work" && location.pathname.startsWith("/work/") ? location.pathname : pages.find(item => item.id === next)!.href;
    if (location.pathname !== href) {
      history.pushState(null, "", href);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    window.dispatchEvent(new Event("prospera:navigate"));
  }, []);
  const openMenu = () => {
    const frame=scene.current?.capture(innerWidth<=600), size=`${innerWidth}:${innerHeight}`;
    if (frame) { setMenuSnapshot(frame); snapshotSize.current=size; }
    else if (snapshotSize.current!==size) setMenuSnapshot(null);
    setPanel("menu"); tone();
  };
  useEffect(() => {
    const back = () => { setPage(location.pathname.startsWith("/work/") ? "work" : location.pathname === "/studio" ? "studio" : pages.find(item => item.href === location.pathname)?.id ?? "home"); setPanel(null); };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  useEffect(() => {
    if(page!=="work") document.title = page === "home" ? "PROSPERA | Websites, CRMs & Automation" : `${pages.find(item=>item.id===page)!.label} | PROSPERA`;
    if (introComplete && !panel) stage.current?.querySelector<HTMLElement>(page === "home" ? "h1" : `#${page} h1, #${page} h2`)?.focus({preventScroll:true});
  }, [page, panel, introComplete]);
  useEffect(() => {
    if (entered) return;
    let cancelled = false;
    const started=performance.now();
    // The counter paces the brand introduction; 100 is reserved for ready assets.
    const steps=window.setInterval(()=>{
      if(!cancelled) setProgress(Math.min(90,Math.floor((performance.now()-started)/motion.loaderMinMs*10)*10));
    },100);
    const done = () => {};
    const logo = new Image(); logo.src = "/prospera-logo.svg";
    const imageTask = logo.decode().catch(() => {}).then(done);
    const fontTask = document.fonts.ready.then(done);
    const minTime = new Promise((resolve) => setTimeout(resolve, reduced ? 150 : motion.loaderMinMs));
    const cap = new Promise((resolve) => setTimeout(resolve, 5000));
    void Promise.all([Promise.race([Promise.all([imageTask, fontTask]), cap]), minTime]).then(() => { if (!cancelled) { clearInterval(steps);setProgress(100); setReady(true); } });
    return () => { cancelled = true; clearInterval(steps); };
  }, [reduced, entered]);

  useLayoutEffect(() => {
    if (!root.current?.querySelector(".p-loader")) return;
    return assembleLoader(root.current, reduced);
  }, [reduced]);

  useEffect(() => {
    if(counter.current) counter.current.textContent=String(progress);
  }, [progress, reduced]);

  useLayoutEffect(() => {
    if (!entered || introComplete || !root.current) return;
    return revealExperience(root.current, reduced, () => setLeaving(false), () => {
      setIntroComplete(true);
    });
  }, [entered, reduced, introComplete]);

  useLayoutEffect(() => {
    if (introComplete) heading.current?.focus({ preventScroll: true });
  }, [introComplete]);

  useEffect(() => {
    document.body.style.overflow = entered && introComplete && !leaving && !panel ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [entered, introComplete, leaving, panel]);

  useEffect(() => {
    const dialog = overlay.current;
    if (panel === "settings") dialog?.showModal(); else dialog?.close();
  }, [panel]);

  useEffect(() => {
    if (reduced || !root.current) return;
    return startMotion(root.current, (frame) => scene.current?.render(frame));
  }, [reduced]);

  useEffect(() => {
    if (reduced || !root.current) return;
    const element = root.current;
    let disposed = false;
    void import("@/lib/logo-scene").then(({ createScene }) => {
      if (!disposed) scene.current = createScene(element);
    }).catch(() => { /* The accessible SVG remains visible if the scene cannot load. */ });
    return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
  }, [reduced]);

  const enter = (enabled: boolean) => {
    if (entryLock.current) return;
    entryLock.current = true;
    window.scrollTo({ top: 0, behavior: "instant" });
    setSound(enabled); enableSound(enabled); tone(740);
    setEntered(true); setLeaving(true);
  };

  const swapTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "light" ? "dark" : "light";
    const apply = () => { setTheme(next);  };
    const doc = document as Document & { startViewTransition?: (callback: () => Promise<void>) => { ready: Promise<void> } };
    if (reduced || !doc.startViewTransition) { apply(); return; }
    const x = event.clientX || innerWidth / 2; const y = event.clientY || 40;
    const transition = doc.startViewTransition(async () => { const { flushSync } = await import("react-dom"); flushSync(apply); });
    void transition.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${Math.hypot(innerWidth,innerHeight)}px at ${x}px ${y}px)`] }, { duration: 850, easing: "cubic-bezier(.65,0,.25,1)", pseudoElement: "::view-transition-new(root)" }));
  };

  return <div ref={root} className="prospera" data-theme={theme} data-reduced={reduced} data-entered={entered} data-intro={introComplete ? "complete" : entered ? "entering" : "waiting"} data-overlay={Boolean(panel) || !introComplete}>
    <a className="p-skip" href="#main">Skip to content</a>
    <div className="p-cursor" aria-hidden="true"><i/></div>
    <div className="p-fluid-lens" aria-hidden="true"/><canvas key="fluid-wake-v2" className="p-pointer-trail" aria-hidden="true" data-active="0"/>
    {(!entered || leaving) && <div ref={loader} className="p-loader p-opening-screen" data-ready={ready}>
      <span className="p-opening-brand">PROSPERA</span>
      <div className="p-loader-center"><div className="p-loader-logo-stage"><Mark className="p-entry-emblem" emblem assembly/></div><p>Build. Grow. Prosper.</p></div>
      <div className="p-opening-count" role="progressbar" aria-label="Loading experience" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span ref={counter}>000</span><small>%</small></div>
      <div className="p-loader-bottom">
        {ready && <div className="p-gate"><button type="button" onClick={() => enter(true)}><span aria-hidden="true">♪</span> Enter with audio</button><button type="button" onClick={() => enter(false)}><span aria-hidden="true">♩</span> Enter without audio</button></div>}
      </div>
    </div>}
    <div ref={stage} className="p-page-stage" data-page={page} inert={!entered || !introComplete} onClick={event => { const link=(event.target as HTMLElement).closest<HTMLAnchorElement>("a[href^=\"#\"]"); const target=link?.getAttribute("href")?.slice(1); if(target && pages.some(item=>item.id===target)){event.preventDefault();navigate(target as PageId);} }}>
      <header className="p-header"><a href="#home" className="p-wordmark" aria-label="PROSPERA home"><Mark className="p-header-logo" wordmark/></a><span className="p-header-note">Digital studio<br/>Mumbai, India</span><div className="p-header-actions"><button onClick={() => setPanel("settings")} aria-label="Open settings">Settings <span>☼</span></button><button onClick={openMenu} aria-label="Open menu">Menu <span className="p-menu-icon">═</span></button></div></header>
      <main id="main"><section id="home" className="p-hero"><div className="p-hero-top"><span className="p-label"><i/> Websites · stores · business tools</span><span className="p-edition">01 — INTRODUCTION</span></div><div className="p-hero-grid"><div className="p-hero-copy"><h1 ref={heading} tabIndex={-1} aria-label="No one cares about your business as much as we do.">{headline.map((line) => <span className="p-line" key={line} aria-hidden="true">{line.split(" ").map((word,index) => <span className="p-word" key={index}>{[...word].map((letter,i) => <span className="p-letter" key={i}>{letter}</span>)} </span>)}</span>)}<span className="p-line p-final" aria-hidden="true"><em>{["we", "do."].map(word => <span className="p-word" key={word}>{[...word].map((letter, i) => <span className="p-letter" key={i}>{letter}</span>)}{word === "we" ? " " : ""}</span>)}</em></span></h1><div className="p-intro"><span className="p-intro-rule"/><p>Websites, CRMs and automation for growing businesses.</p><a href="#contact" className="p-cta" data-magnetic onClick={() => tone()}>Let’s talk <span>↗</span></a></div></div><div className="p-art p-cartoon-studio" role="group" aria-label="An animated three-dimensional creative computer studio"><div className="p-studio-screen" aria-hidden="true"><i/><i/><i/></div><div className="p-studio-lamp" aria-hidden="true"/><div className="p-studio-glow" aria-hidden="true"/><canvas className="p-gl" aria-hidden="true"/><div className="p-room-interaction" tabIndex={0} role="group" aria-label="Explore the three-dimensional studio" aria-describedby="p-room-help" data-lenis-prevent="true"/><div className="p-sculpture"><Mark className="p-main-mark" emblem/></div><span id="p-room-help" className="p-sr-only">Drag to explore the three-dimensional studio.</span><span className="p-studio-status">Creative systems at work</span></div></div><div className="p-hero-bottom"><a href="#studio">Explore the studio <span>↓</span></a></div></section>
      <section className="p-studio" id="studio"><AboutContent active={page==="studio"} reduced={reduced}/></section>
      <section className="p-work" id="work"><WorkExperience active={page==="work"} reduced={reduced} initialProject={initialProject}/></section>
      <footer id="contact"><ContactInquiry/></footer></main>
    </div>
    {panel === "menu" && <GalleryMenu source={stage} active={page} snapshot={menuSnapshot} reduced={reduced} onSelect={navigate} onClose={closeMenu}/>}
    <dialog ref={overlay} className={`p-dialog ${panel === "menu" ? "p-dialog-menu" : ""}`} aria-label={panel === "menu" ? "Navigation" : "Settings"} onCancel={() => setPanel(null)} onClick={(event) => { if (event.target === overlay.current) setPanel(null); }}><div className="p-fluid-lens" aria-hidden="true"/><canvas key="fluid-wake-v2" className="p-pointer-trail" aria-hidden="true" data-active="0"/><div className="p-dialog-inner"><div className="p-dialog-top"><span className="p-label">Make it your own</span><button onClick={() => setPanel(null)} aria-label="Close panel">Close ×</button></div><div className="p-preferences"><div><span>Appearance<small>Choose your atmosphere</small></span><button onClick={swapTheme}>{theme === "light" ? "Light ☼" : "Dark ☾"}</button></div><div><span>Sound<small>Soft tones on entry and interaction</small></span><button aria-pressed={sound} onClick={() => { const next = !sound; setSound(next); enableSound(next); tone(); }}>{sound ? "On" : "Off"}</button></div><div><span>Reduce motion<small>{systemReduced ? "Enabled by your device settings" : "A calmer browsing experience"}</small></span><button aria-pressed={reduced} disabled={systemReduced} onClick={() => setReduced(!reduced)}>{reduced ? "On" : "Off"}</button></div></div></div></dialog>
  </div>;
}
