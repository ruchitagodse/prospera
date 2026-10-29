"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

export type PageId = "home" | "studio" | "work" | "contact";
export const pages: { id: PageId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "studio", label: "About", href: "/about" },
  { id: "work", label: "Work", href: "/work" },
  { id: "contact", label: "Contact", href: "/contact" },
];

function StaticPreview({ page }: { page: "studio" | "work" | "contact" }) {
  if (page === "studio") return <div className="p-preview-static p-preview-about-image" role="img" aria-label="PROSPERA About page with floating gold discs"/>;
  if (page === "work") return <div className="p-preview-static p-preview-work p-preview-work-image" role="img" aria-label="PROSPERA selected work gallery preview"/>;
  return <div className="p-preview-static p-preview-contact"><div className="p-preview-static-head"><b>PROSPERA</b><span>04 / Contact</span></div><div className="p-preview-contact-copy"><small>Let’s make something</small><h2>Let’s build<br/><em>together.</em></h2><p>Tell us about your project<br/>and we’ll get in touch.</p></div><div className="p-preview-contact-form"><span>Client</span><span>Email</span><i/><i/><i/><button>Start a conversation ↗</button></div></div>;
}

export function GalleryMenu({ source, active, snapshot, reduced, onSelect, onClose }: {
  source: RefObject<HTMLElement | null>; active: PageId; snapshot: string | null; reduced: boolean;
  onSelect: (page: PageId) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const finish = useRef<(page?: PageId) => void>(() => {});

  useLayoutEffect(() => {
    const element = dialog.current, track = rail.current;
    const pageSource = source.current;
    if (!element || !track || !pageSource) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".p-gallery-card"));
    const copies: HTMLElement[] = [];
    const clonedPreviews: HTMLElement[] = [];
    for (const card of cards) {
      if (card.dataset.page === "contact") {
        const preview = card.querySelector<HTMLElement>(".p-preview-static");
        if (preview) copies.push(preview);
        continue;
      }
      const copy = pageSource.cloneNode(true) as HTMLElement;
      copy.classList.add("p-preview-page");
      copy.dataset.page = card.dataset.page;
      if (card.dataset.page === "work") {
        copy.dataset.workView = "gallery";
        copy.querySelector('.p-work-view')?.setAttribute('data-view','gallery');
        copy.querySelector('.p-work-case')?.remove();
      }
      // The contact experience is a fixed overlay, not page content. Keeping it
      // in the scaled navigation clones makes it escape every preview card.
      copy.querySelector("footer#contact")?.remove();
      copy.inert = true; copy.setAttribute("aria-hidden", "true");
      const svgIds = new Map<string,string>();
      copy.querySelectorAll("[id]").forEach(node => {
        if (node instanceof SVGElement) { const id=node.id, next=`preview-${card.dataset.page}-${id}`;svgIds.set(id,next);node.id=next; }
        else node.removeAttribute("id");
      });
      copy.querySelectorAll("svg *").forEach(node => {
        for (const attribute of ["fill","stroke","clip-path","href"]) {
          const value=node.getAttribute(attribute); if (!value) continue;
          let next=value;svgIds.forEach((replacement,id)=>{next=next.replace(`url(#${id})`,`url(#${replacement})`).replace(new RegExp(`^#${id}$`),`#${replacement}`);});
          if(next!==value)node.setAttribute(attribute,next);
        }
      });
      copy.querySelectorAll("[tabindex]").forEach(node => node.removeAttribute("tabindex"));
      const canvas = copy.querySelector<HTMLCanvasElement>(".p-gl");
      if (canvas && snapshot) {
        const image = document.createElement("img");
        image.src = snapshot; image.alt = ""; image.className = canvas.className;
        image.style.cssText = canvas.style.cssText; canvas.replaceWith(image);
      } else {
        canvas?.remove(); copy.querySelector(".p-art")?.removeAttribute("data-gl");
        copy.querySelector(".p-hero")?.removeAttribute("data-room");
      }
      copy.querySelectorAll("canvas").forEach(node => node.remove());
      copy.querySelectorAll("[data-work-gl]").forEach(node => node.removeAttribute("data-work-gl"));
      card.querySelector(".p-gallery-window")?.append(copy); copies.push(copy); clonedPreviews.push(copy);
    }
    element.showModal();
    const activeCard = cards.find(card => card.dataset.page === active)!;
    track.scrollLeft = Math.max(0, activeCard.offsetLeft - (track.clientWidth-activeCard.offsetWidth)/2);
    const size = () => {
      copies.forEach(copy => {
        const host = copy.parentElement!;
        const previewWidth = Math.max(1280,innerWidth);
        copy.style.width = `${previewWidth}px`;
        const scale = host.clientWidth/previewWidth;
        copy.style.setProperty("--preview-height", `${host.clientHeight/scale}px`);
        copy.style.minHeight = `${host.clientHeight/scale}px`;
        copy.style.transform = `scale(${scale})`;
      });
    };
    size();
    const observer = new ResizeObserver(size); observer.observe(track);
    let drag: { x: number; left: number; id: number } | null = null, dragged = false;
    let targetScroll = track.scrollLeft, edgeFrame = 0, lastScrollTime = 0;
    const stopEdgeScroll = () => {
      if (edgeFrame) cancelAnimationFrame(edgeFrame);
      edgeFrame = 0;
      lastScrollTime = 0;
      targetScroll = track.scrollLeft;
    };
    const animateEdgeScroll = (time: number) => {
      const dt = lastScrollTime ? Math.min((time-lastScrollTime)/1000,.05) : 1/60;
      lastScrollTime = time;
      if (busy.current || drag) { stopEdgeScroll(); return; }
      const difference = targetScroll-track.scrollLeft;
      track.scrollLeft += difference*(1-Math.exp(-dt*7));
      if (Math.abs(difference) > 1) edgeFrame = requestAnimationFrame(animateEdgeScroll);
      else { track.scrollLeft = targetScroll; edgeFrame = 0; lastScrollTime = 0; }
    };
    const updateEdgeScroll = (event: PointerEvent) => {
      if (reduced || event.pointerType !== "mouse" || drag || busy.current) return;
      const bounds = track.getBoundingClientRect();
      // Map the full pointer travel to the full gallery, with a small margin
      // so the first and last tabs are reachable without touching the edges.
      const progress = Math.max(0,Math.min(1,((event.clientX-bounds.left)/bounds.width-.07)/.86));
      targetScroll = progress*Math.max(0,track.scrollWidth-track.clientWidth);
      if (!edgeFrame) edgeFrame = requestAnimationFrame(animateEdgeScroll);
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || busy.current) return;
      stopEdgeScroll(); dragged = false; drag = { x: event.clientX, left: track.scrollLeft, id: event.pointerId };
    };
    const move = (event: PointerEvent) => {
      if (!drag) { updateEdgeScroll(event); return; }
      if (Math.abs(event.clientX-drag.x)>6) { dragged = true; track.setPointerCapture(drag.id); }
      if (dragged) { event.preventDefault(); track.scrollLeft = drag.left-(event.clientX-drag.x); }
    };
    const up = () => { if (drag && track.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); drag = null; };
    const click = (event: MouseEvent) => { if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; } };
    const wheel = (event: WheelEvent) => {
      stopEdgeScroll();
      if (busy.current || Math.abs(event.deltaY)<=Math.abs(event.deltaX)) return;
      event.preventDefault(); track.scrollLeft += event.deltaY*(event.deltaMode===1?16:1);
    };
    const nativeDrag = (event: DragEvent) => event.preventDefault();
    track.addEventListener("pointerdown",down);track.addEventListener("pointermove",move);track.addEventListener("pointerup",up);track.addEventListener("pointercancel",up);track.addEventListener("pointerleave",stopEdgeScroll);
    track.addEventListener("click",click,true);track.addEventListener("wheel",wheel,{passive:false});track.addEventListener("dragstart",nativeDrag);
    const duration = reduced ? 0 : .85;
    const bounds = activeCard.querySelector(".p-gallery-window")!.getBoundingClientRect();
    const flight = (card: HTMLElement) => {
      const window = card.querySelector<HTMLElement>(".p-gallery-window")!;
      const box = window.getBoundingClientRect();
      const clone = window.cloneNode(true) as HTMLElement;
      clone.classList.add("p-gallery-flight");
      Object.assign(clone.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
      element.append(clone); return clone;
    };
    busy.current = true;
    const context = gsap.context(() => {
      gsap.fromTo(".p-gallery-backdrop", { opacity: 0 }, { opacity: 1, duration });
      gsap.fromTo(cards.filter(card => card !== activeCard), { y: 65, opacity: 0 }, { y: 0, opacity: 1, duration: duration*.8, stagger: reduced?0:.06, delay: duration*.25 });
      const opening = flight(activeCard);
      gsap.set(activeCard, { visibility: "hidden" });
      gsap.fromTo(opening, { x: -bounds.left, y: -bounds.top, scaleX: innerWidth/bounds.width, scaleY: innerHeight/bounds.height }, {
        x: 0, y: 0, scaleX: 1, scaleY: 1, duration, ease: "power3.inOut",
        onComplete: () => { busy.current = false; gsap.set(activeCard, { visibility: "visible" }); opening.remove(); },
      });
      gsap.fromTo(".p-gallery-top,.p-gallery-caption", { opacity: 0 }, { opacity: 1, duration: duration*.5, delay: duration*.6 });
    }, element);
    finish.current = (page = active) => {
      if (busy.current) return;
      busy.current = true;
      const selected = cards.find(card => card.dataset.page === page)!;
      selected.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
      if(reduced){onSelect(page);element.close();onClose();return;}
      const box=selected.querySelector('.p-gallery-window')!.getBoundingClientRect();
      const circle=document.createElement('div');
      circle.className='p-tab-gold-circle';circle.setAttribute('aria-hidden','true');
      const x=box.left+box.width/2,y=box.top+box.height/2;
      circle.style.clipPath=`circle(0px at ${x}px ${y}px)`;
      element.append(circle);
      const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
      const transition=gsap.timeline({onComplete:()=>circle.remove()});
      transition.to(circle,{clipPath:`circle(${radius}px at ${x}px ${y}px)`,duration:.8,ease:'power3.inOut'},0);
      transition.call(()=>{
        (pageSource.closest('.prospera')??document.body).append(circle);
        onSelect(page);element.close();onClose();
      },[],.38);
      transition.to(circle,{opacity:0,duration:.55,ease:'power2.out'},.25);
    };
    const escape = (event: Event) => { event.preventDefault(); finish.current(); };
    element.addEventListener("cancel", escape);
    return () => {
      up();stopEdgeScroll();track.removeEventListener("pointerdown",down);track.removeEventListener("pointermove",move);track.removeEventListener("pointerup",up);track.removeEventListener("pointercancel",up);track.removeEventListener("pointerleave",stopEdgeScroll);track.removeEventListener("click",click,true);track.removeEventListener("wheel",wheel);track.removeEventListener("dragstart",nativeDrag);
      context.revert(); gsap.killTweensOf(cards); element.querySelectorAll(".p-gallery-flight").forEach(node=>{gsap.killTweensOf(node);node.remove();}); observer.disconnect(); element.removeEventListener("cancel",escape); element.close(); clonedPreviews.forEach(copy=>copy.remove());
    };
  }, [source, active, snapshot, reduced, onSelect, onClose]);

  return <dialog ref={dialog} className="p-gallery" aria-label="Explore PROSPERA">
    <div className="p-gallery-backdrop" aria-hidden="true"/>
    <div className="p-gallery-top"><span>PROSPERA <small>Explore PROSPERA</small></span><button type="button" onClick={()=>finish.current()} aria-label="Close navigation">Close ×</button></div>
    <div ref={rail} className="p-gallery-rail" data-lenis-prevent="true">
      {pages.map((page,index)=><a href={page.href} key={page.id} className="p-gallery-card" data-page={page.id} aria-label={`Open ${page.label}`} aria-current={active===page.id?"page":undefined} onClick={event=>{event.preventDefault();finish.current(page.id);}}>
        <div className="p-gallery-window" aria-hidden="true"><div className="p-gallery-preview-header" data-dark={page.id === "work"}><b>PROSPERA</b><span>Digital studio<br/>Mumbai, India</span><small>{String(index+1).padStart(2,"0")} / {page.label}</small></div>{page.id === "contact" ? <StaticPreview page={page.id}/> : null}</div>
        <span className="p-gallery-caption"><small>0{index+1}</small>{page.label}<i>↗</i></span>
      </a>)}
    </div>
  </dialog>;
}
