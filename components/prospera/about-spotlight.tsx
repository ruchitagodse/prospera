"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./about-discs.css";

const stories=[
{label:"The purpose",title:"Less complexity.",body:"We simplify the way businesses work through custom software, CRM systems, apps, and automation — making data, operations, and everyday tasks easier to manage."},
{label:"The vision",title:"Room to prosper.",body:"We bring technology and creativity together — from websites and SaaS products to distinctive branding, brochures, and original creatives that keep businesses recognised and remembered."},
{label:"The person",title:"Ruchita Godse",body:"Driven by the belief that every business deserves thoughtful design, practical technology, and the opportunity to prosper."}
];
export function AboutSpotlight({active,reduced}:{active:boolean;reduced:boolean}){
 const [selected,setSelected]=useState(0);
 const root=useRef<HTMLDivElement>(null);
 const pointer=useRef({x:50,y:40,last:0});
 const swipe=useRef<number|null>(null);
 const select=(i:number)=>setSelected((i+3)%3);
 useEffect(()=>{
  if(!active||reduced||!root.current)return;
  const element=root.current;
  let x=50,y=40;
  const tick=(time:number,delta:number)=>{
   if(document.hidden||element.closest<HTMLElement>('.prospera')?.dataset.overlay==='true')return;
   const idle=performance.now()-pointer.current.last>1600;
   const f=1-Math.exp(-Math.min(delta,40)/180);
   x+=((idle?50+Math.sin(time*.28)*44:pointer.current.x)-x)*f;
   y+=((idle?40+Math.cos(time*.28)*12:pointer.current.y)-y)*f;
   element.style.setProperty('--light-x',x+'%');element.style.setProperty('--light-y',y+'%');
   const outer=element.getBoundingClientRect();
   element.querySelectorAll<HTMLElement>('.p-about-disc').forEach(disc=>{
    const box=disc.getBoundingClientRect();
    disc.style.setProperty('--spot-x',outer.width*x/100-(box.left-outer.left)+'px');
    disc.style.setProperty('--spot-y',outer.height*y/100-(box.top-outer.top)+'px');
    disc.style.setProperty('--shade',(50-x)*.12+'px');
   });
  };
  gsap.ticker.add(tick);return()=>{gsap.ticker.remove(tick);};
 },[active,reduced]);
 const story=stories[selected];
 return <div className="p-about-discs" ref={root} data-reduced={reduced} onPointerMove={e=>{
  if(e.pointerType==='touch')return;const b=e.currentTarget.getBoundingClientRect();
  pointer.current={x:(e.clientX-b.left)/b.width*100,y:(e.clientY-b.top)/b.height*100,last:performance.now()};
 }}>
 <div className="p-discs-top"><span>02 / About PROSPERA</span><span>Three sides of the studio</span></div>
 <div className="p-discs-layout">
 <div className="p-discs-story" key={selected} id="about-story" role="tabpanel" aria-labelledby={'disc-'+selected}>
 <span className="p-discs-eyebrow">0{selected+1} / {story.label}</span><div className="p-discs-heading-float"><h1 tabIndex={-1}>{story.title}</h1></div>
 {selected===2&&<span className="p-discs-role">Founder · PROSPERA</span>}
 <p>{story.body}</p>
 <div className="p-discs-controls"><button type="button" onClick={()=>select(selected-1)} aria-label="Previous story">←</button><span>0{selected+1} / 03</span><button type="button" onClick={()=>select(selected+1)} aria-label="Next story">→</button></div>
 </div>
 <div className="p-discs-gallery" role="tablist" aria-label="Explore the studio" onKeyDown={e=>{
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(selected+(e.key==='ArrowRight'?1:2))%3;select(next);root.current?.querySelector<HTMLButtonElement>('#disc-'+next)?.focus();}
 }} onTouchStart={e=>{swipe.current=e.touches[0].clientX;}} onTouchEnd={e=>{
 if(swipe.current!==null){const d=e.changedTouches[0].clientX-swipe.current;if(Math.abs(d)>45)select(selected+(d<0?1:-1));}swipe.current=null;
 }}>
 {stories.map((item,i)=><button type="button" key={item.label} id={'disc-'+i} className="p-about-disc" data-position={(i-selected+3)%3} role="tab" aria-selected={selected===i} aria-controls="about-story" aria-label={item.label+': '+item.title} tabIndex={selected===i?0:-1} onClick={()=>select(i)}>
 <span className="p-disc-face"><span className="p-disc-rim">PROSPERA — {item.label}</span>
 {i===0?<svg viewBox="0 0 240 240" fill="none" aria-hidden="true"><path d="M25 55C110 55 70 120 155 120M25 120H205M25 185C110 185 70 120 155 120M175 90l30 30-30 30"/><circle cx="155" cy="120" r="7"/></svg>:i===1?<span className="p-disc-words" aria-hidden="true">Build.<br/>Grow.<br/><em>Prosper.</em></span>:<span className="p-disc-monogram" aria-hidden="true">RG</span>}
 <span className="p-disc-note">0{i+1} / {i===0?'Simplify the everyday':i===1?'Room to prosper':'Personal by design'}</span></span></button>)}
 </div></div>
 <div className="p-discs-wave" aria-hidden="true"><svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 45Q180 5 360 40T720 40T1080 40T1440 45V80H0Z"/></svg><svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 50Q180 15 360 45T720 45T1080 45T1440 50V80H0Z"/></svg></div>
 <div className="p-discs-bottom"><span>Mumbai, India</span><span>Click a disc to explore ↗</span><a href="#contact">Let’s talk ↗</a></div>
 </div>;
}
