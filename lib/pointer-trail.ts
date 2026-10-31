import { createFluidWake } from "@/lib/fluid-wake";
import { motion } from "@/config/motion";

/** A continuous wake driven by the shared ticker, with a soft 2D fallback. */
export function createPointerTrail(root: HTMLElement) {
  const canvases=Array.from(root.querySelectorAll<HTMLCanvasElement>(".p-pointer-trail"));
  const main=canvases.find(canvas=>!canvas.closest("dialog"));
  if(!main)return null;
  const modal=canvases.find(canvas=>canvas.closest("dialog"));
  const modalContext=modal?.getContext("2d");
  const lenses=Array.from(root.querySelectorAll<HTMLElement>(".p-fluid-lens"));
  let fluid=createFluidWake(main);
  let fallback: HTMLCanvasElement|null=null;
  let context: CanvasRenderingContext2D|null=null;
  const clouds=new Float32Array(64*7);
  const makeSprite=(dark:boolean)=>{
    const canvas=document.createElement("canvas");canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext("2d")!;
    const gradient=ctx.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,dark?"rgba(223,177,83,.32)":"rgba(150,105,35,.17)");
    gradient.addColorStop(.4,dark?"rgba(202,151,61,.18)":"rgba(166,118,45,.08)");
    gradient.addColorStop(1,"rgba(190,143,57,0)");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);return canvas;
  };
  const darkSprite=makeSprite(true),lightSprite=makeSprite(false);
  const initFallback=()=>{
    if(fallback)return;
    main.style.visibility="hidden";
    fallback=document.createElement("canvas");fallback.className="p-pointer-trail";fallback.setAttribute("aria-hidden","true");fallback.dataset.engine="soft-wake";
    main.parentElement?.appendChild(fallback);context=fallback.getContext("2d");root.dataset.wakeEngine="soft-wake";
  };
  if(!fluid)initFallback();else root.dataset.wakeEngine="fluid";
  let width=innerWidth,height=innerHeight;
  let targetX=0,targetY=0,x=0,y=0,hasPointer=false,awake=false,inverted=false;
  let lastInput=0,emitted=0,cloudIndex=0,energy=0,angle=0;
  const sizeFallback=()=>{
    const ratio=Math.min(devicePixelRatio||1,1.25);
    if(fallback){fallback.width=Math.round(width*ratio);fallback.height=Math.round(height*ratio);context?.setTransform(ratio,0,0,ratio,0,0);}
    if(modal){modal.width=Math.round(width*ratio);modal.height=Math.round(height*ratio);modalContext?.setTransform(ratio,0,0,ratio,0,0);}
  };
  const resize=()=>{
    width=innerWidth;height=innerHeight;
    try{fluid?.resize(width,height);}catch{fluid?.dispose();fluid=null;initFallback();}
    sizeFallback();
  };
  const clear=()=>{
    fluid?.clear();context?.clearRect(0,0,width,height);modalContext?.clearRect(0,0,width,height);clouds.fill(0);hasPointer=false;awake=false;energy=0;
    canvases.forEach(canvas=>{canvas.dataset.active="0";});
    lenses.forEach(lens=>{lens.style.opacity="0";});
  };
  const visibility=()=>{if(document.hidden)clear();};
  resize();window.addEventListener("resize",resize);window.addEventListener("blur",clear);
  document.documentElement.addEventListener("pointerleave",clear);document.addEventListener("visibilitychange",visibility);
  return {
    move(px:number,py:number,target:EventTarget|null){
      if(root.dataset.intro!=="complete")return;
      inverted=target instanceof Element && !!target.closest(".p-studio");
      if(!hasPointer){targetX=x=px;targetY=y=py;hasPointer=true;}
      targetX=px;targetY=py;lastInput=performance.now()/1000;awake=true;
    },
    render(dt:number,wind:number){
      if(!awake)return;
      const now=performance.now()/1000;
      if(now-lastInput>motion.wakeSettleSeconds){clear();return;}
      if(main.dataset.engine==="unavailable"&&fluid){fluid.dispose();fluid=null;initFallback();sizeFallback();}
      dt=Math.max(.001,Math.min(.033,dt));
      const blend=1-Math.exp(-dt/motion.wakePointerLag);
      const dx=(targetX-x)*blend,dy=(targetY-y)*blend;
      x+=dx;y+=dy;
      const speed=Math.hypot(dx,dy)/dt;
      energy+=(Math.min(1,speed/1200)-energy)*(1-Math.exp(-dt*8));
      const dark=(root.dataset.theme==="dark")!==inverted;
      if(now-lastInput<.22 && Math.hypot(dx,dy)>.15){
        const samples=Math.min(4,Math.max(1,Math.ceil(Math.hypot(dx,dy)/20)));
        for(let i=1;i<=samples;i++){
          const px=x-dx+dx*i/samples,py=y-dy+dy*i/samples;
          const strength=Math.min(1.1,.12+speed/1500)/Math.sqrt(samples)*Math.min(1.5,dt*60);
          fluid?.splat(px,py,dx/dt,dy/dt,strength);
          if(!fluid){const p=cloudIndex++%64*7;clouds[p]=px;clouds[p+1]=py;clouds[p+2]=dx/dt*.08;clouds[p+3]=dy/dt*.08;clouds[p+4]=1.4;clouds[p+5]=36+strength*46;clouds[p+6]=emitted*.8;}
          emitted++;
        }
        canvases.forEach(canvas=>{canvas.dataset.emitted=String(emitted);});
        angle=Math.atan2(dy,dx);
      }
      if(fluid)fluid.step(dt,dark);
      else if(context){
        context.clearRect(0,0,width,height);
        for(let p=0;p<clouds.length;p+=7){
          if(clouds[p+4]<=0)continue;
          clouds[p+4]-=dt;clouds[p]+=clouds[p+2]*dt+Math.sin(now*2+clouds[p+6])*dt*9+wind*dt;clouds[p+1]+=clouds[p+3]*dt+Math.cos(now*2+clouds[p+6])*dt*9;
          const size=clouds[p+5]*(1+(1.4-clouds[p+4])*.45);context.globalAlpha=Math.max(0,clouds[p+4]/1.4)*.65;
          context.drawImage(dark?darkSprite:lightSprite,clouds[p]-size,clouds[p+1]-size,size*2,size*2);
        }
        context.globalAlpha=1;
      }
      const source=fallback??main;
      if(modalContext&&modal?.closest("dialog")?.open){modalContext.clearRect(0,0,width,height);modalContext.drawImage(source,0,0,source.width,source.height,0,0,width,height);}
      lenses.forEach(lens=>{
        lens.style.transform=`translate3d(${x-dx*.7}px,${y-dy*.7}px,0) rotate(${angle}rad) scale(${.55+energy*.65},${.6+energy*.35})`;
        lens.style.opacity=String(energy*.36*Math.max(0,1-(now-lastInput)/.7));
      });
      canvases.forEach(canvas=>{canvas.dataset.active="1";});
    },
    dispose(){
      clear();fluid?.dispose();fallback?.remove();main.style.removeProperty("visibility");delete root.dataset.wakeEngine;
      window.removeEventListener("resize",resize);window.removeEventListener("blur",clear);document.documentElement.removeEventListener("pointerleave",clear);document.removeEventListener("visibilitychange",visibility);
    },
  };
}
