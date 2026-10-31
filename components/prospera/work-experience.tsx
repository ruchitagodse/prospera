"use client";
/* eslint-disable @next/next/no-img-element -- Local SVG previews are shared with WebGL textures and animated image overlays. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { inCategory, ownershipLabel, workAsset, workCategories, workProjects, type WorkCategory, type WorkProject } from "@/content/work";
import type { createWorkScene, WorkCardRect } from "@/lib/work-scene";
import "./work.css";

export function WorkExperience({ active, reduced, initialProject = null }: { active: boolean; reduced: boolean; initialProject?: string | null }) {
  const [category,setCategory]=useState<WorkCategory>("All"),[index,setIndex]=useState(0);
  const [slug,setSlug]=useState<string|null>(initialProject);
  const filtered=useMemo(()=>workProjects.filter(project=>inCategory(project,category)),[category]);
  const selected=workProjects.find(project=>project.slug===slug);
  const current=filtered[index%filtered.length];
  const root=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
  const scene=useRef<ReturnType<typeof createWorkScene>>(null),busy=useRef(false),flights=useRef<HTMLElement[]>([]);
  const lastCard=useRef<WorkCardRect|null>(null);
  const galleryIndex=useRef(0),activeProject=useRef<string|null>(initialProject);
  const updateIndex=useCallback((next:number)=>{galleryIndex.current=next;setIndex(next);},[]);
  const openRef=useRef<(project:WorkProject,rect?:WorkCardRect)=>void>(()=>{});
  const restoreSelection=useCallback((projectSlug:string)=>{
    const filteredIndex=filtered.findIndex(project=>project.slug===projectSlug);
    const next=filteredIndex>=0?filteredIndex:workProjects.findIndex(project=>project.slug===projectSlug);
    if(next<0)return;
    if(filteredIndex<0)setCategory("All");
    galleryIndex.current=next;setIndex(next);
    if(filteredIndex>=0)scene.current?.go(next);
  },[filtered]);
  useLayoutEffect(()=>{galleryIndex.current=index;activeProject.current=slug;},[index,slug]);

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
    const sync=()=>{const next=location.pathname.split("/")[2],valid=workProjects.some(project=>project.slug===next);if(!valid&&activeProject.current)restoreSelection(activeProject.current);setSlug(valid?next:null);};
    window.addEventListener("popstate",sync);window.addEventListener("prospera:navigate",sync);
    return()=>{window.removeEventListener("popstate",sync);window.removeEventListener("prospera:navigate",sync);};
  },[restoreSelection]);
  useLayoutEffect(()=>{
    const parent=root.current?.closest<HTMLElement>(".p-page-stage");if(parent)parent.dataset.workView=selected?"project":"gallery";
    if(active)document.title=selected?`${selected.title} | PROSPERA`:"Work | PROSPERA";
  },[selected,active]);
  useEffect(()=>{
    if(!stage.current||reduced||!active)return;
    const element=stage.current;let cancelled=false;
    void import("@/lib/work-scene").then(({createWorkScene})=>{
      if(!cancelled)scene.current=createWorkScene(element,filtered,updateIndex,(next,rect)=>openRef.current(filtered[next],rect),galleryIndex.current);
    });
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  },[filtered,reduced,active,updateIndex]);
  useEffect(()=>{
    if(!selected)return;
    const media=root.current?.querySelectorAll<HTMLElement>(".p-case-media");
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed="true";observer.unobserve(entry.target);}}),{threshold:.1});
    media?.forEach(element=>observer.observe(element));return()=>observer.disconnect();
  },[selected]);
  const go=(next:number)=>{const value=(next+filtered.length)%filtered.length;galleryIndex.current=value;setIndex(value);scene.current?.go(value);};
  const back=()=>{
    if(busy.current)return;busy.current=true;
    const image=root.current?.querySelector<HTMLElement>(".p-case-cover");
    window.scrollTo({top:0,behavior:"instant"});const from=image?.getBoundingClientRect();
    let flight:HTMLImageElement|null=null;
    if(from&&selected){flight=document.createElement("img");flight.src=workAsset(selected.slug);flight.alt="";flight.className="p-work-flight";Object.assign(flight.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});document.body.append(flight);flights.current.push(flight);}
    if(selected)restoreSelection(selected.slug);
    flushSync(()=>setSlug(null));history.pushState(null,"","/work");
    const target=lastCard.current??{left:innerWidth*.4,top:innerHeight*.25,width:innerWidth*.2,height:innerHeight*.4};
    const finish=()=>{busy.current=false;root.current?.querySelector<HTMLElement>(".p-work-caption>a")?.focus({preventScroll:true});};
    if(flight)gsap.to(flight,{...target,duration:reduced?0:.9,ease:"power3.inOut",onComplete:()=>{flight?.remove();flights.current=flights.current.filter(value=>value!==flight);finish();}});else finish();
    gsap.fromTo(stage.current,{opacity:0},{opacity:1,duration:reduced?0:.8,clearProps:"opacity"});
  };
  const nextProject=selected?workProjects[(workProjects.indexOf(selected)+1)%workProjects.length]:null;
  return <div ref={root} className="p-work-view" data-view={selected?"project":"gallery"}>
    <div className="p-work-gallery">
      <h1 className="p-sr-only" tabIndex={-1}>Selected work</h1>
      <div className="p-work-topline"><span>04 / SELECTED WORK</span><span>PROFESSIONAL EXPERIENCE / PROSPERA PROJECTS</span></div>
      <div ref={stage} className="p-work-stage" role="group" tabIndex={0} data-lenis-prevent="true" aria-label="Project carousel. Drag, scroll or use the arrow keys to explore." onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();go(index+(event.key==="ArrowRight"?1:-1));}}}>
        <canvas className="p-work-canvas" aria-hidden="true"/>
        <div className="p-work-fallback">{filtered.map((project,i)=><a href={`/work/${project.slug}`} key={project.slug} aria-label={`Open ${project.title}, project details`} className="p-work-fallback-card" style={{"--card-offset":i-index} as React.CSSProperties} onClick={event=>{event.preventDefault();openRef.current(project,event.currentTarget.getBoundingClientRect());}}><img src={workAsset(project.slug)} alt=""/><span>{project.title}</span></a>)}</div>
      </div>
      <div className="p-work-bottom"><div className="p-work-caption" key={current.slug}><span className="p-work-preview-label">{ownershipLabel(current)}</span><h2>{current.title}</h2><p>{current.description}</p><a href={`/work/${current.slug}`} onClick={event=>{event.preventDefault();openRef.current(current);}}>Explore project <span>↗</span></a></div>
        <div className="p-work-controls"><details className="p-work-filter"><summary>Filter <span>☷</span></summary><div>{workCategories.map(value=><button type="button" key={value} aria-pressed={category===value} onClick={event=>{setCategory(value);setIndex(0);event.currentTarget.closest("details")?.removeAttribute("open");}}>{value}<span>{value==="All"?workProjects.length:workProjects.filter(project=>inCategory(project,value)).length}</span></button>)}</div></details>
          <div className="p-work-pagination"><button type="button" aria-label="Previous project" onClick={()=>go(index-1)}>←</button><span>{String(index%filtered.length+1).padStart(2,"0")}</span><div role="toolbar" aria-label="Choose a project">{filtered.map((project,i)=><button type="button" key={project.slug} aria-label={`Show ${project.title}`} aria-pressed={i===index%filtered.length} onClick={()=>go(i)}/>)}</div><span>{String(filtered.length).padStart(2,"0")}</span><button type="button" aria-label="Next project" onClick={()=>go(index+1)}>→</button></div>
        </div><span className="p-work-drag-hint">DRAG TO EXPLORE ↔</span>
      </div>
    </div>
    {selected&&<article className="p-work-case">
      <div className="p-case-back"><button type="button" onClick={back}>↙ Back to work</button><span>{ownershipLabel(selected)}</span></div>
      <div className="p-case-opening"><div className="p-case-left"><dl className="p-case-info"><div><dt>Type ↴</dt><dd>{selected.categories.join(" / ")}</dd></div><div><dt>Ownership ↴</dt><dd>{ownershipLabel(selected)}</dd></div><div><dt>Scope ↴</dt><dd className="p-case-tags">{selected.features.map(value=><span key={value}>{value}</span>)}</dd></div><div><dt>Business challenge ↴</dt><dd>{selected.challenge ?? "The original business brief and specific challenges are awaiting confirmation."}</dd></div></dl><div className="p-case-heading"><h1 tabIndex={-1}>{selected.title}</h1><p>{selected.description}</p></div></div><figure className="p-case-cover"><img src={workAsset(selected.slug)} alt={selected.coverImage ? `${selected.title}: portfolio cover composed from restyled project screenshots` : selected.screenshots[0]?.alt ?? `${selected.title}: actual screenshot pending`}/></figure></div>
      <div className="p-case-statement"><span>Solution ↪</span><p>{selected.solution ?? "The delivered solution and implementation scope will be documented once confirmed."}</p></div>
      {selected.screenshots.length > 0 ? <>
        <figure className="p-case-media" data-revealed="false"><img src={selected.screenshots[0].src} alt={selected.screenshots[0].alt} width={selected.screenshots[0].width} height={selected.screenshots[0].height} loading="lazy"/><figcaption>01 / {selected.screenshots[0].caption ?? selected.screenshots[0].alt}</figcaption></figure>
        {Array.from({ length: Math.ceil((selected.screenshots.length - 1) / 2) }, (_, row) => <div className="p-case-pair" key={row}>{selected.screenshots.slice(1 + row * 2, 3 + row * 2).map((shot, offset) => <figure className="p-case-media" data-revealed="false" key={shot.src}><img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" style={{ aspectRatio: "auto", objectFit: "contain" }}/><figcaption>{String(2 + row * 2 + offset).padStart(2, "0")} / {shot.caption ?? shot.alt}</figcaption></figure>)}</div>)}
      </> : <>
      <figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug,"desktop")} alt={selected.screenshots[1]?.alt ?? `${selected.title}: actual screenshot pending`} loading="lazy"/><figcaption>{selected.screenshots[1]?.caption ?? "01 / ACTUAL SCREENSHOT PENDING"}</figcaption></figure>
      <div className="p-case-pair"><figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug,"mobile")} alt={selected.screenshots[2]?.alt ?? `${selected.title}: actual screenshot pending`} loading="lazy"/><figcaption>{selected.screenshots[2]?.caption ?? "02 / ACTUAL SCREENSHOT PENDING"}</figcaption></figure><figure className="p-case-media" data-revealed="false"><img src={workAsset(selected.slug)} alt={selected.screenshots[0]?.alt ?? `${selected.title}: actual screenshot pending`} loading="lazy"/><figcaption>{selected.screenshots[0]?.caption ?? "03 / ACTUAL SCREENSHOT PENDING"}</figcaption></figure></div>
      </>}
      <dl className="p-case-info"><div><dt>Industry ↴</dt><dd>{selected.industry}</dd></div><div><dt>Technologies ↴</dt><dd>{selected.technologies.length ? selected.technologies.join(", ") : "Technology stack to be confirmed."}</dd></div><div><dt>Individual contribution ↴</dt><dd>{selected.contribution ?? "Role, responsibilities and scope of contribution to be confirmed."}</dd></div><div><dt>Live preview ↴</dt><dd>{selected.liveUrl ? <a href={selected.liveUrl} target="_blank" rel="noreferrer">Visit live project ↗</a> : "No public preview URL has been supplied."}</dd></div></dl>
      <div className="p-case-footnote"><span>PROJECT CONTEXT</span><p>{selected.ownership === "Professional Experience" ? "Developed through professional employment. Employer and client ownership is retained. Inclusion describes the founder’s experience and does not imply a PROSPERA-owned client project." : selected.ownership === "PROSPERA Project" ? "PROSPERA Project." : "Delivered through independent freelance work."} {selected.mediaNote ?? "Actual screenshots will be added when available and approved for public display."}</p></div>
      <div className="p-case-contact"><h2>Something similar<br/><em>on your mind?</em></h2><a href="#contact">Let’s talk <span>↗</span></a></div>
      {nextProject&&<a className="p-case-next" href={`/work/${nextProject.slug}`} onClick={event=>{event.preventDefault();openRef.current(nextProject,event.currentTarget.getBoundingClientRect());}}><span>NEXT PROJECT ↘</span><h2>{nextProject.title}</h2><img src={workAsset(nextProject.slug)} alt=""/></a>}
    </article>}
  </div>;
}
