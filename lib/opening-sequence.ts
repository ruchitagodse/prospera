import gsap from "gsap";

/** Nested word/letter transforms keep the entrance separate from live wind. */
export function assembleLoader(root: HTMLElement, reduced: boolean) {
  const context = gsap.context(() => {
    gsap.fromTo('.p-loader-logo-stage',{y:reduced?0:10,opacity:reduced?1:0},{y:0,opacity:1,duration:reduced?0:1.1,ease:'power3.out'});
    gsap.fromTo('[data-opening-letter]', { opacity: reduced ? 1 : 0 }, { opacity: 1, duration: reduced ? 0 : .85, delay: reduced ? 0 : .15 });
    gsap.fromTo('[data-opening-arrow-reveal]', { attr: { width: reduced ? 290 : 0 } }, { attr: { width: 290 }, duration: reduced ? 0 : 1, delay: reduced ? 0 : 1.35, ease: 'power2.inOut' });
    gsap.fromTo(".p-loader-center p", { autoAlpha: 0, y: reduced ? 0 : 8 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .8, delay: reduced ? 0 : 1.5 });
  }, root);
  return () => context.revert();
}

export function revealExperience(root: HTMLElement, reduced: boolean, onUncovered: () => void, onComplete: () => void) {
  const loader = root.querySelector(".p-loader");
  const words = root.querySelectorAll(".p-hero h1 .p-word");
  const art = root.querySelector(".p-art");
  const extras = root.querySelectorAll(".p-header, .p-hero-top, .p-intro, .p-hero-bottom");
  const portal=document.createElement('div');
  portal.className='p-opening-iris';portal.setAttribute('aria-hidden','true');
  if(!reduced)root.append(portal);
  const source=root.querySelector<SVGSVGElement>('.p-entry-emblem');
  const destination=art?.getBoundingClientRect();
  let flying:HTMLDivElement|null=null;
  if(!reduced&&source&&destination&&destination.width>0){
    const from=source.getBoundingClientRect();
    flying=document.createElement('div');
    flying.className='p-opening-gold-orbit';
    const size=42;
    Object.assign(flying.style,{left:`${from.left+from.width/2-size/2}px`,top:`${from.top+from.height/2-size/2}px`,width:`${size}px`,height:`${size}px`});
    flying.setAttribute('aria-hidden','true');root.append(flying);root.dataset.logoFlight='true';root.dataset.logoBlend='0';
  }
  const context = gsap.context(() => {
    const timeline = gsap.timeline({ onComplete });
    gsap.set([...words, ...extras], { autoAlpha: 0 });
    if (reduced) {
      timeline.to(loader, { autoAlpha: 0, duration: .15 });
      timeline.call(onUncovered);
      timeline.set([...words, ...(art ? [art] : []), ...extras], { autoAlpha: 1, clearProps: "transform" });
      return;
    }
    const canvas = root.querySelector<HTMLCanvasElement>(".p-gl");
    if (canvas && art) timeline.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, .35);
    timeline.to(".p-loader-bottom, .p-loader-top, .p-opening-brand, .p-opening-count, .p-loader-center p, .p-loader-logo-stage", {
      y: -12, autoAlpha: 0, duration: .45, ease: "power2.inOut",
    }, 0);
    timeline.to(loader,{autoAlpha:0,duration:.32,ease:'power2.inOut'},.08);
    if(flying&&destination){
      const size=42;
      const targetLeft=destination.left+destination.width*.53-size/2;
      const targetTop=destination.top+destination.height*.48-size/2;
      timeline.to(flying,{left:targetLeft,top:targetTop,duration:1.28,ease:'power3.inOut'},.15);
      timeline.to(flying,{scale:3.8,autoAlpha:0,duration:.58,ease:'power2.out'},1.22);
      timeline.call(()=>{delete root.dataset.logoFlight;},[],1.45);
      const blend={value:0};
      timeline.to(blend,{value:1,duration:.95,ease:'sine.inOut',onUpdate:()=>{root.dataset.logoBlend=String(blend.value);}},1.45);
      timeline.call(()=>{flying?.remove();delete root.dataset.logoBlend;},[],2.4);
    }
    timeline.fromTo(portal,{'--opening-radius':'0px'},{'--opening-radius':`${Math.hypot(innerWidth,innerHeight)*.65}px`,duration:1.45,ease:'power3.inOut'},.25);
    timeline.fromTo('.p-header, .p-hero-top',{y:-8},{y:0,autoAlpha:1,duration:.75,stagger:.07},.8);
    timeline.fromTo(words,{yPercent:45,rotation:1},{yPercent:0,rotation:0,autoAlpha:1,duration:1,stagger:.05,ease:'power3.out'},.85);
    timeline.call(onUncovered,[],1.7);
    timeline.fromTo('.p-intro',{y:12},{y:0,autoAlpha:1,duration:.65},1.5);
    timeline.fromTo('.p-hero-bottom',{y:6},{y:0,autoAlpha:1,duration:.6},1.7);
    timeline.call(()=>portal.remove());
  }, root);
  return () => {context.revert();portal.remove();flying?.remove();delete root.dataset.logoFlight;delete root.dataset.logoBlend;delete root.dataset.logoFinish;};
}
