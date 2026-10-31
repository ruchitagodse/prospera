import gsap from "gsap";
import Lenis from "lenis";
import { motion } from "@/config/motion";
import { createPointerTrail } from "@/lib/pointer-trail";
import { createHeroAtmosphere } from "@/lib/hero-atmosphere";

export type Frame = { time: number; dt: number; x: number; y: number; wind: number; scroll: number };
export function startMotion(root: HTMLElement, render?: (frame: Frame) => void) {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const trail = fine ? createPointerTrail(root) : null;
  const atmosphere = createHeroAtmosphere(root);
  const lenis = new Lenis({ lerp: motion.scrollLerp });
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, sx: innerWidth / 2, sy: innerHeight / 2, lastX: innerWidth / 2, vx: 0 };
  const frame: Frame = { time: 0, dt: 0, x: 0, y: 0, wind: 0, scroll: 0 };
  const cursor = root.querySelector<HTMLElement>(".p-cursor");
  const dot = cursor?.querySelector<HTMLElement>("i");
  const mark = root.querySelector<HTMLElement>(".p-sculpture");
  const letters = Array.from(root.querySelectorAll<HTMLElement>(".p-letter"));
  const letterStates = letters.map(el => ({ el, cx: 0, cy: 0, x: 0, y: 0, vx: 0, vy: 0, angle: 0 }));
  const textStates=new Map<HTMLElement,{y:number;angle:number}>();
  const collectText=()=>{
    for(const el of textStates.keys()) if(!root.contains(el)) textStates.delete(el);
    root.querySelectorAll<HTMLElement>('h1,h2,h3,p,a,button,label,small,span').forEach(el=>{
      if(el.closest('.p-loader,.p-preview-page,.p-preview-static,.p-gallery-card,svg,[aria-hidden="true"],.p-sr-only,.p-word,.p-letter,.p-relief-words')) return;
      if(el.querySelector('.p-letter') || !el.textContent?.trim()) return;
      // Animate the smallest text surface only, so nested controls never double up.
      if(el.querySelector('h1,h2,h3,p,a,button,label,small,span')) return;
      if(!textStates.has(el)) textStates.set(el,{y:0,angle:0});
    });
  };
  collectText();
  const contentObserver=new MutationObserver(collectText);
  contentObserver.observe(root,{childList:true,subtree:true});
  const title = root.querySelector<HTMLElement>(".p-hero h1");
  let letterAmplitude = 8;
  const measureLetters = () => {
    letterAmplitude = Math.min(9,(title?.clientWidth??600)*.013);
    const transforms = letters.map(el => el.style.transform);
    letters.forEach(el => { el.style.transform = "none"; });
    letterStates.forEach((state, i) => { const r = state.el.getBoundingClientRect(); state.cx = r.left + r.width/2; state.cy = r.top + window.scrollY + r.height/2; state.el.style.transform = transforms[i]; });
  };
  const textObserver = new ResizeObserver(measureLetters); if (title) textObserver.observe(title);
  measureLetters();
  const refreshLetters=()=>{requestAnimationFrame(measureLetters);};
  window.addEventListener('prospera:navigate',refreshLetters);
  root.querySelectorAll('.p-scene-panel-copy h2').forEach(el=>textObserver.observe(el));
  let pointerSeen = false, lastPointerY = pointer.y, pointerSpeed = 0;
  const leave = () => { pointerSeen = false; pointerSpeed = 0; };
  let wasOpening = root.dataset.intro !== "complete";
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointerSeen = true;
    pointer.x = event.clientX; pointer.y = event.clientY;
    trail?.move(event.clientX,event.clientY,event.target);
  };
  const tick = (time: number, delta: number) => {
    if (document.hidden) return;
    if (root.dataset.overlay === "true") lenis.stop(); else lenis.start();
    if (root.dataset.intro !== "complete" && window.scrollY !== 0) lenis.scrollTo(0, { immediate: true, force: true });
    if (wasOpening && root.dataset.intro === "complete") { lenis.scrollTo(0, { immediate: true, force: true }); measureLetters(); wasOpening = false; }
    lenis.raf(time * 1000);
    const smooth = 1 - Math.exp(-Math.min(delta, 40) / motion.pointerLagMs);
    pointer.sx += (pointer.x - pointer.sx) * smooth; pointer.sy += (pointer.y - pointer.sy) * smooth;
    pointerSpeed += (Math.hypot(pointer.x-pointer.lastX,pointer.y-lastPointerY)/Math.max(delta/1000,.001)-pointerSpeed)*.15;
    pointer.vx += ((pointer.x - pointer.lastX) - pointer.vx) * .12; pointer.lastX = pointer.x; lastPointerY = pointer.y;
    frame.time = time; frame.dt = Math.min(delta, 40) / 1000; frame.scroll = lenis.scroll;
    frame.x = fine ? Math.max(-.5, Math.min(.5, pointer.sx / innerWidth - .5)) : 0;
    frame.y = fine ? Math.max(-.5, Math.min(.5, pointer.sy / innerHeight - .5)) : 0;
    frame.wind = Math.max(-motion.windClamp, Math.min(motion.windClamp, pointer.vx * motion.mouseGain + lenis.velocity * motion.scrollGain));
    if (cursor && fine) cursor.style.transform = `translate3d(${pointer.sx}px,${pointer.sy}px,0)`;
    if (dot && fine) dot.style.transform = `translate(${pointer.x-pointer.sx}px,${pointer.y-pointer.sy}px)`;
    if (mark && root.dataset.intro === "complete") mark.style.transform = `rotateX(${frame.y * -12}deg) rotateY(${frame.x * 18}deg) translateY(${Math.sin(time * .6) * 4}px)`;
    if (fine) letterStates.forEach(state => {
      const dx=state.cx-pointer.x, dy=state.cy-frame.scroll-pointer.y;
      const influence=pointerSeen&&root.dataset.overlay!=="true"?Math.exp(-(dx*dx+dy*dy)/(145*145)):0;
      const strength=influence*Math.min(1.4,.18+pointerSpeed/850);
      const targetY=Math.sin(dx*.024-time*3.2)*strength*letterAmplitude;
      const targetX=Math.max(-4,Math.min(4,frame.wind))*strength*.8;
      const dt=Math.min(frame.dt,.025);
      state.vx+=((targetX-state.x)*90-state.vx*16)*dt;
      state.vy+=((targetY-state.y)*90-state.vy*16)*dt;
      state.x+=state.vx*dt;state.y+=state.vy*dt;
      state.angle+=(strength*Math.sin(dx*.018-time*2)*3-state.angle)*(1-Math.exp(-dt*10));
      state.el.style.transform=`translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0) rotate(${state.angle.toFixed(2)}deg) skewX(${(strength*frame.wind*.7).toFixed(2)}deg)`;
    });
    if(fine && root.dataset.intro==='complete') textStates.forEach((state,el)=>{
      const rect=el.getBoundingClientRect();
      if(!rect.width || rect.bottom<0 || rect.top>innerHeight) return;
      const dx=rect.left+rect.width*.5-pointer.x;
      const dy=rect.top+rect.height*.5-pointer.y;
      const reach=Math.max(120,Math.min(240,rect.width*.5));
      const influence=pointerSeen?Math.exp(-(dx*dx+dy*dy)/(reach*reach)):0;
      const size=parseFloat(getComputedStyle(el).fontSize)||16;
      const amplitude=Math.min(5,Math.max(1.2,size*.06));
      const strength=influence*Math.min(1.2,.25+pointerSpeed/1000);
      const follow=1-Math.exp(-frame.dt*10);
      state.y+=(Math.sin(dx*.024-time*3.2)*strength*amplitude-state.y)*follow;
      state.angle+=(Math.sin(dx*.018-time*2)*strength*.7-state.angle)*follow;
      el.style.translate=`0 ${state.y.toFixed(2)}px`;
      el.style.rotate=`${state.angle.toFixed(2)}deg`;
    });
    render?.(frame);
    atmosphere?.render(time, frame.dt);
    trail?.render(frame.dt,frame.wind);
  };
  const magnets = fine ? Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]")).map((el) => {
    const x = gsap.quickTo(el,"x",{duration:.7,ease:"power3.out"});
    const y = gsap.quickTo(el,"y",{duration:.7,ease:"power3.out"});
    const hover = (e: PointerEvent) => { const r = el.getBoundingClientRect(); x((e.clientX-r.left-r.width/2)*.2); y((e.clientY-r.top-r.height/2)*.2); };
    const reset = () => { x(0); y(0); };
    el.addEventListener("pointermove",hover); el.addEventListener("pointerleave",reset);
    return () => { el.removeEventListener("pointermove",hover); el.removeEventListener("pointerleave",reset); gsap.killTweensOf(el); gsap.set(el,{clearProps:"transform"}); };
  }) : [];
  const visibility = () => { if (document.hidden) lenis.stop(); else lenis.start(); };
  window.addEventListener("pointermove",move,{passive:true}); document.addEventListener("visibilitychange",visibility);
  window.addEventListener("blur",leave); document.addEventListener("pointerleave",leave);
  gsap.ticker.lagSmoothing(0); gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick); lenis.destroy(); trail?.dispose(); atmosphere?.dispose(); textObserver.disconnect(); window.removeEventListener("pointermove",move); document.removeEventListener("visibilitychange",visibility);
    window.removeEventListener("blur",leave); document.removeEventListener("pointerleave",leave);
    magnets.forEach((dispose) => dispose()); letters.forEach((letter) => letter.style.removeProperty("transform")); mark?.style.removeProperty("transform");
    window.removeEventListener('prospera:navigate',refreshLetters);
    contentObserver.disconnect();
    textStates.forEach((_,el)=>{el.style.removeProperty('translate');el.style.removeProperty('rotate');});
  };
}
