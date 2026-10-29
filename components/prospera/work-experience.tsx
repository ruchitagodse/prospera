"use client";
/* eslint-disable @next/next/no-img-element -- Local SVG previews are shared with WebGL textures and animated image overlays. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { workAsset, workCategories, workProjects, type WorkCategory, type WorkProject } from "@/content/work";
import type { createWorkScene, WorkCardRect } from "@/lib/work-scene";
import "./work.css";

export function WorkExperience({ active, reduced, initialProject = null }: { active: boolean; reduced: boolean; initialProject?: string | null }) {
  const [category,setCategory]=useState<WorkCategory>("All"),[index,setIndex]=useState(0);
  const [slug,setSlug]=useState<string|null>(initialProject);
  const filtered=useMemo(()=>workProjects.filter(project=>category==="All"||project.category===category),[category]);
  const selected=workProjects.find(project=>project.slug===slug);
  const current=filtered[index%filtered.length];
  const root=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
  const scene=useRef<ReturnType<typeof createWorkScene>>(null),busy=useRef(false),flights=useRef<HTMLElement[]>([]);
  const lastCard=useRef<WorkCardRect|null>(null);
  const updateIndex=useCallback((next:number)=>setIndex(next),[]);
  const openRef=useRef<(project:WorkProject,rect?:WorkCardRect)=>void>(()=>{});

  useLayoutEffect(()=>{
    const element=root.current;if(!element)return;
    const fly=(project:WorkProject,from:WorkCardRect,to:WorkCardRect,finish:()=>void)=>{
      const image=document.createElement("img");image.src=workAsset(project.slug);image.alt="";image.className="p-work-flight";
      Object.assign(image.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});
      document.body.append(image);flights.current.push(image);
      gsap.to(image,{left:to.left,top:to.top,width:to.width,height:to.height,borderRadius:24,duration:reduced?0:1.1,ease:"power3.inOut",onComplete:()=>{image.remove();flights.current=flights.current.filter(value=>value!==image);finish();}});
    };
    openRef.current=(project,rect)=>{
      if(busy.current)return;busy.current=true;
      if(rect)lastCard.current=rect;
      if(!reduced){
        const wash=document.createElement("div");wash.className="p-work-transition-wash";document.body.append(wash);flights.current.push(wash);
        gsap.to(wash,{opacity:0,duration:1,ease:"power2.inOut",onComplete:()=>{wash.remove();flights.current=flights.current.filter(value=>value!==wash);}});
      }
      flushSync(()=>setSlug(project.slug));
      history.pushState(null,"",`/work/${project.slug}`);window.scrollTo({top:0,behavior:"instant"});
      const cover=element.querySelector<HTMLElement>(".p-case-cover")!,to=cover.getBoundingClientRect();
      cover.style.visibility="hidden";
      const from=rect??{left:innerWidth*.36,top:innerHeight*.22,width:innerWidth*.28,height:innerHeight*.45};
      gsap.fromTo(element.querySelectorAll(".p-case-info,.p-case-heading"),{opacity:0,y:24},{opacity:1,y:0,duration:reduced?0:.7,delay:reduced?0:.4,ease:"power2.out",clearProps:"transform,opacity"});
      fly(project,from,to,()=>{cover.style.visibility="";busy.current=false;element.querySelector<HTMLElement>(".p-case-heading h1")?.focus({preventScroll:true});});
    };
    return()=>{flights.current.forEach(image=>{gsap.killTweensOf(image);image.remove();});flights.current=[];busy.current=false;const cover=element.querySelector<HTMLElement>(".p-case-cover");if(cover)cover.style.visibility="";};
  },[reduced]);

  useEffect(()=>{
    const sync=()=>{const next=location.pathname.split("/")[2];setSlug(workProjects.some(project=>project.slug===next)?next:null);};
    window.addEventListener("popstate",sync);window.addEventListener("prospera:navigate",sync);
    return()=>{window.removeEventListener("popstate",sync);window.removeEventListener("prospera:navigate",sync);};
  },[]);
  useLayoutEffect(()=>{
    const parent=root.current?.closest<HTMLElement>(".p-page-stage");if(parent)parent.dataset.workView=selected?"project":"gallery";
    if(active)document.title=selected?`${selected.title} — Preview | PROSPERA`:"Work | PROSPERA";
  },[selected,active]);
  useEffect(()=>{
    if(!stage.current||reduced||!active)return;
    const element=stage.current;let cancelled=false;
    void import("@/lib/work-scene").then(({createWorkScene})=>{
      if(!cancelled)scene.current=createWorkScene(element,filtered,updateIndex,(next,rect)=>openRef.current(filtered[next],rect));
    });
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  },[filtered,reduced,active,updateIndex]);
  useEffect(()=>{
    if(!selected)return;
    const media=root.current?.querySelectorAll<HTMLElement>(".p-case-media");
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed="true";observer.unobserve(entry.target);}}),{threshold:.1});
    media?.forEach(element=>observer.observe(element));return()=>observer.disconnect();
  },[selected]);
  const go=(next:number)=>{const value=(next+filtered.length)%filtered.length;setIndex(value);scene.current?.go(value);};
  const back=()=>{
    if(busy.current)return;busy.current=true;
    const image=root.current?.querySelector<HTMLElement>(".p-case-cover");
    window.scrollTo({top:0,behavior:"instant"});const from=image?.getBoundingClientRect();
    let flight:HTMLImageElement|null=null;
    if(from&&selected){flight=document.createElement("img");flight.src=workAsset(selected.slug);flight.alt="";flight.className="p-work-flight";Object.assign(flight.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});document.body.append(flight);flights.current.push(flight);}
    flushSync(()=>setSlug(null));history.pushState(null,"","/work");
    const target=lastCard.current??{left:innerWidth*.4,top:innerHeight*.25,width:innerWidth*.2,height:innerHeight*.4};
    if(flight)gsap.to(flight,{...target,duration:reduced?0:.9,ease:"power3.inOut",onComplete:()=>{flight?.remove();flights.current=flights.current.filter(value=>value!==flight);busy.current=false;}});else busy.current=false;
    gsap.fromTo(stage.current,{opacity:0},{opacity:1,duration:reduced?0:.8,clearProps:"opacity"});
  };
  const nextProject=selected?workProjects[(workProjects.indexOf(selected)+1)%workProjects.length]:null;
  return <div ref={root} className="p-work-view" data-view={selected?"project":"gallery"}>
    <div className="p-work-gallery">
      <h1 className="p-sr-only" tabIndex={-1}>Selected work</h1>
      <div className="p-work-topline"><span>04 / SELECTED WORK</span><span>DESIGN PREVIEWS · REAL PROJECTS COMING NEXT</span></div>
      <div ref={stage} className="p-work-stage" data-lenis-prevent="true" aria-label="Project carousel. Drag or scroll to explore." onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();go(index+(event.key==="ArrowRight"?1:-1));}}}>
        <canvas className="p-work-canvas" aria-hidden="true"/>
        <div className="p-work-fallback">{filtered.map((project,i)=><a href={`/work/${project.slug}`} key={project.slug} aria-label={`Open ${project.title}, design preview`} className="p-work-fallback-card" style={{"--card-offset":i-index} as React.CSSProperties} onClick={event=>{event.preventDefault();openRef.current(project,event.currentTarget.getBoundingClientRect());}}><img src={workAsset(project.slug)} alt=""/><span>{project.title}</span></a>)}</div>
      </div>
      <div className="p-work-bottom"><div className="p-work-caption" key={current.slug}><span className="p-work-preview-label">{current.category} / DESIGN PREVIEW</span><h2>{current.title}</h2><p>{current.subtitle}</p><a href={`/work/${current.slug}`} onClick={event=>{event.preventDefault();openRef.current(current);}}>Explore preview <span>↗</span></a></div>
        <div className="p-work-controls"><details className="p-work-filter"><summary>Filter <span>☷</span></summary><div>{workCategories.map(value=><button type="button" key={value} aria-pressed={category===value} onClick={event=>{setCategory(value);setIndex(0);event.currentTarget.closest("details")?.removeAttribute("open");}}>{value}<span>{value==="All"?workProjects.length:workProjects.filter(project=>project.category===value).length}</span></button>)}</div></details>
          <div className="p-work-pagination"><button type="button" aria-label="Previous project" onClick={()=>go(index-1)}>←</button><span>{String(index%filtered.length+1).padStart(2,"0")}</span><div role="toolbar" aria-label="Choose a project">{filtered.map((project,i)=><button type="button" key={project.slug} aria-label={`Show ${project.title}`} aria-pressed={i===index%filtered.length} onClick={()=>go(i)}/>)}</div><span>{String(filtered.length).padStart(2,"0")}</span><button type="button" aria-label="Next project" onClick={()=>go(index+1)}>→</button></div>
        </div><span className="p-work-drag-hint">DRAG TO EXPLORE ↔</span>
      </div>
    </div>
    {selected&&<article className="p-work-case">
      <div className="p-case-back"><button type="button" onClick={back}>↙ Back to work</button><span>PROSPERA / DESIGN PREVIEW</span></div>
      <div className="p-case-opening"><div className="p-case-left"><dl className="p-case-info"><div><dt>Type ↴</dt><dd>{selected.category}</dd></div><div><dt>Status ↴</dt><dd>Design preview</dd></div><div><dt>Scope ↴</dt><dd className="p-case-tags">{selected.scope.map(value=><span key={value}>{value}</span>)}</dd></div><div><dt>Illustrative brief ↴</dt><dd>{selected.brief}</dd></div></dl><div className="p-case-heading"><h1 tabIndex={-1}>{selected.title}</h1><p>{selected.subtitle}</p></div></div><figure className="p-case-cover"><img src={workAsset(selected.slug)} alt={`${selected.title}: illustrative ${selected.category.toLowerCase()} concept`}/></figure></div>
      <div className="p-case-statement"><span>Design approach ↪</span><p>{selected.approach}</p></div>
      <figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug,"desktop")} alt={`${selected.title}: desktop interface design preview`} loading="lazy"/><figcaption>01 / THE BIGGER PICTURE</figcaption></figure>
      <div className="p-case-pair"><figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug,"mobile")} alt={`${selected.title}: mobile layout design preview`} loading="lazy"/><figcaption>02 / A CLOSER LOOK</figcaption></figure><figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug)} alt={`${selected.title}: presentation detail`} loading="lazy"/><figcaption>03 / IN CONTEXT</figcaption></figure></div>
      <div className="p-case-footnote"><span>ABOUT THIS PREVIEW</span><p>This is an illustrative design study, not a completed client project. Real project screenshots, credits, results, and live links will be added when the portfolio is ready.</p></div>
      <div className="p-case-contact"><h2>Something similar<br/><em>on your mind?</em></h2><a href="#contact">Let’s talk <span>↗</span></a></div>
      {nextProject&&<a className="p-case-next" href={`/work/${nextProject.slug}`} onClick={event=>{event.preventDefault();openRef.current(nextProject,event.currentTarget.getBoundingClientRect());}}><span>NEXT PREVIEW ↘</span><h2>{nextProject.title}</h2><img src={workAsset(nextProject.slug)} alt=""/></a>}
    </article>}
  </div>;
}
