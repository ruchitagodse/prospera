import * as THREE from "three";
import gsap from "gsap";
import { workAsset, type WorkProject } from "@/content/work";

export type WorkCardRect = { left: number; top: number; width: number; height: number };
export function createWorkScene(host: HTMLElement, projects: readonly WorkProject[], onChange: (index: number) => void, onOpen: (index: number, rect: WorkCardRect) => void) {
  const canvas = host.querySelector<HTMLCanvasElement>(".p-work-canvas");
  if (!canvas || !projects.length) return null;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  camera.position.set(0, 2.65, 12); camera.lookAt(0, 2.1, 0);
  const geometry = new THREE.PlaneGeometry(2.03, 2.8, 26, 38);
  const textures = projects.map(project => {
    const texture = new THREE.TextureLoader().load(workAsset(project.slug));
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return texture;
  });
  const materials: THREE.ShaderMaterial[] = [], cards: THREE.Mesh[] = [], reflections: THREE.Mesh[] = [];
  const vertex = `varying vec2 vUv;uniform float uTime,uVelocity,uClick,uHover;uniform vec2 uClickUv,uHoverUv,uWind;
    void main(){vUv=uv;vec3 p=position;p.z+=pow((uv.x-.5)*2.,2.)*.09;
    p.x+=sin(uv.y*17.+uTime*2.)*uVelocity*.018;
    p.z+=sin(uv.y*27.+uTime)*uVelocity*.012;
    float wave=sin(uClick*3.14159);float radius=length((uv-uClickUv)*vec2(.73,1.));
    p.z+=sin(radius*32.-uClick*16.)*wave*.2;
    p.xy+=(uv-uClickUv)*wave*.12;
    vec2 drift=uv-uHoverUv;float breeze=exp(-dot(drift,drift)*8.)*uHover;
    p.z+=breeze*(.16+sin(drift.y*15.-uTime*4.)*.055);
    p.xy+=uWind*breeze*.055;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const fragment = `varying vec2 vUv;uniform sampler2D uImage;uniform float uTime,uVelocity,uReflection,uFocus,uClick,uDim,uHover;uniform vec2 uClickUv,uHoverUv,uWind;
    float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
    void main(){vec2 uv=(vUv-.5)*1.11+.5;float d=box(uv-.5,vec2(.485),.055);
    float inside=1.-smoothstep(-.005,.002,d);float edge=exp(-abs(d+.007)*130.);
    float glow=exp(-abs(d)*45.)*.55;vec2 tex=clamp(uv,0.,1.);
    tex.x+=sin(uv.y*65.+uTime)*uVelocity*.001;
    float wave=sin(uClick*3.14159);vec2 radial=uv-uClickUv;float radius=length(radial);
    tex+=radial/max(radius,.01)*sin(radius*38.-uClick*17.)*wave*.025;
    vec2 drift=uv-uHoverUv;float breeze=exp(-dot(drift,drift)*9.)*uHover;
    tex+=uWind*breeze*.012;
    vec3 ink=texture2D(uImage,tex).rgb;
    float ribs=.96+.04*sin(uv.x*750.);ink*=ribs;
    vec3 gold=vec3(1.,.71,.29);vec3 color=ink*(.72+.28*uFocus)+gold*edge*(.75+.65*uFocus+wave*1.7);
    color+=gold*exp(-pow((radius-uClick*.85)*18.,2.))*wave*.28;color*=uDim;
    color+=gold*(breeze*.12+edge*uHover*.65);
    float alpha=max(inside,glow);if(d>0.)color=gold;
    if(uReflection>.5){alpha*=.3*pow(1.-clamp(vUv.y,0.,1.),2.);color*=.8;}
    gl_FragColor=vec4(color,alpha);}`;
  const material = (index: number, reflection: number) => {
    const value = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: {
      uImage: { value: textures[index] }, uTime: { value: 0 }, uVelocity: { value: 0 }, uReflection: { value: reflection }, uFocus: { value: 0 }, uClick: { value: 0 }, uClickUv: { value: new THREE.Vector2(.5,.5) }, uDim: { value: 1 },
      uHover: { value: 0 }, uHoverUv: { value: new THREE.Vector2(.5,.5) }, uWind: { value: new THREE.Vector2() },
    }, vertexShader: vertex, fragmentShader: fragment }); materials.push(value); return value;
  };
  const slots = projects.length < 3 ? projects.length : 18;
  for (let i = 0; i < slots; i++) {
    const index = i % projects.length;
    const card = new THREE.Mesh(geometry, material(index,0));card.userData.index=index;scene.add(card);cards.push(card);
    const reflection = new THREE.Mesh(geometry, material(index,1));reflection.scale.y=-1;scene.add(reflection);reflections.push(reflection);
  }
  const lines: number[] = [];
  for (let i=-12;i<=12;i+=2) { lines.push(i,6.3,-22,i,6.3,10);lines.push(-18,6.3,i,18,6.3,i); }
  const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute("position",new THREE.Float32BufferAttribute(lines,3));
  const lineMaterial=new THREE.LineBasicMaterial({color:0x9b783e,transparent:true,opacity:.11});scene.add(new THREE.LineSegments(lineGeometry,lineMaterial));
  const arcPoints=[];for(let i=0;i<=120;i++){const angle=(i/120-.5)*Math.PI;arcPoints.push(new THREE.Vector3(Math.sin(angle)*8.8,.65,(Math.cos(angle)-1)*8.8));}
  const arcGeometry=new THREE.BufferGeometry().setFromPoints(arcPoints),arcMaterial=new THREE.LineBasicMaterial({color:0xd8af68,transparent:true,opacity:.6});scene.add(new THREE.Line(arcGeometry,arcMaterial));
  let current=0,target=0,velocity=0,lastIndex=-1,lastInput=performance.now(),width=1,height=1,lost=false;
  let down: { x:number;y:number;target:number;time:number } | null=null, moved=false;
  let opening: THREE.Mesh | null = null;
  const launch = { progress: 0 };
  let hovered: THREE.Mesh | null=null;
  const hoverUv=new THREE.Vector2(.5,.5),wind=new THREE.Vector2(),lastHover=new THREE.Vector2();
  let pointerSeen=false;
  const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(),projected=new THREE.Vector3();
  const modulo=(value:number,count:number)=>((value%count)+count)%count;
  const resize=()=>{const r=host.getBoundingClientRect();width=r.width;height=r.height;if(width<1||height<1)return;const compact=width<600;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=compact?52:34;camera.position.z=compact?9.5:8.8;camera.lookAt(0,compact?2:2.1,0);camera.setViewOffset(width,height,0,height*(compact?.02:.1),width,height);camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const tick=(time:number,delta:number)=>{
    if(lost||document.hidden||host.closest<HTMLElement>(".p-page-stage")?.dataset.page!=="work"||host.closest<HTMLElement>(".prospera")?.dataset.intro!=="complete"||host.getBoundingClientRect().width===0)return;
    const dt=Math.min(delta/1000,.04);
    if(opening)target=current;
    else if(projects.length<3)target=THREE.MathUtils.clamp(target,0,projects.length-1);
    else if(!down&&!hovered&&performance.now()-lastInput>1200)target+=dt*.32;
    const previous=current;current+=(target-current)*(1-Math.exp(-dt*9));velocity+=(Math.max(-8,Math.min(8,(current-previous)/Math.max(dt,.001)))-velocity)*.15;
    cards.forEach((card,i)=>{
      const distance=projects.length<3?i-current:modulo(i-current+slots/2,slots)-slots/2,angle=distance*.235;
      card.position.set(Math.sin(angle)*8.8,2.1,(Math.cos(angle)-1)*8.8);card.rotation.y=angle;
      card.scale.setScalar(1);
      const uniforms=(card.material as THREE.ShaderMaterial).uniforms;
      const follow=1-Math.exp(-dt*9);
      uniforms.uHover.value+=((card===hovered&&!opening&&!down?1:0)-uniforms.uHover.value)*follow;
      if(card===hovered)uniforms.uHoverUv.value.lerp(hoverUv,follow);
      uniforms.uWind.value.lerp(wind,follow);
      card.position.z+=uniforms.uHover.value*.22;
      card.rotation.y+=(uniforms.uHoverUv.value.x-.5)*uniforms.uHover.value*.12;
      card.rotation.x=-(uniforms.uHoverUv.value.y-.5)*uniforms.uHover.value*.1;
      if(card===opening){const lift=gsap.parseEase("power2.out")(launch.progress);card.position.z+=lift*1.6;card.position.y+=Math.sin(launch.progress*Math.PI)*.12;card.scale.setScalar(1+lift*.1);card.rotation.y*=1-lift*.7;}
      card.visible=Math.abs(distance)<7;
      const reflection=reflections[i];reflection.position.copy(card.position);reflection.position.y=-.8;reflection.rotation.y=angle;reflection.visible=card.visible;
      const mirror=(reflection.material as THREE.ShaderMaterial).uniforms;mirror.uHover.value=uniforms.uHover.value;mirror.uHoverUv.value.copy(uniforms.uHoverUv.value);mirror.uWind.value.copy(uniforms.uWind.value);
      for(const mesh of [card,reflection]){const uniforms=(mesh.material as THREE.ShaderMaterial).uniforms;uniforms.uTime.value=time;uniforms.uVelocity.value=opening?0:velocity;uniforms.uFocus.value=Math.max(0,1-Math.abs(distance)*.45);uniforms.uClick.value=card===opening?launch.progress:0;uniforms.uDim.value=opening&&card!==opening?1-launch.progress*.65:1;}
    });
    const index=modulo(Math.round(current),projects.length);if(index!==lastIndex){lastIndex=index;onChange(index);}
    renderer.render(scene,camera);
    wind.multiplyScalar(Math.exp(-dt*5));
  };
  const setPointer=(x:number,y:number)=>{const r=host.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);};
  const open=(event:PointerEvent)=>{
    if(opening)return;
    setPointer(event.clientX,event.clientY);const hit=raycaster.intersectObjects(cards.filter(card=>card.visible))[0];if(!hit)return;
    opening=hit.object as THREE.Mesh;launch.progress=0;target=current;host.dataset.opening="true";
    (opening.material as THREE.ShaderMaterial).uniforms.uClickUv.value.copy(hit.uv??new THREE.Vector2(.5,.5));
    gsap.to(launch,{progress:1,duration:.65,ease:"none",onComplete:()=>{
      const card=opening;if(!card)return;card.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(card),min=new THREE.Vector2(Infinity,Infinity),max=new THREE.Vector2(-Infinity,-Infinity);
      for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){projected.set(x,y,z).project(camera);min.min(new THREE.Vector2((projected.x+1)*width/2,(-projected.y+1)*height/2));max.max(new THREE.Vector2((projected.x+1)*width/2,(-projected.y+1)*height/2));}
      const bounds=host.getBoundingClientRect();onOpen(card.userData.index,{left:bounds.left+min.x,top:bounds.top+min.y,width:max.x-min.x,height:max.y-min.y});
      opening=null;launch.progress=0;lastInput=performance.now();delete host.dataset.opening;
    }});
  };
  const pointerDown=(event:PointerEvent)=>{if(event.button!==0||opening)return;lastInput=performance.now();moved=false;down={x:event.clientX,y:event.clientY,target,time:performance.now()};host.setPointerCapture(event.pointerId);};
  const pointerMove=(event:PointerEvent)=>{
    if(!down){
      if(event.pointerType==="touch"||opening)return;
      if(pointerSeen)wind.set(THREE.MathUtils.clamp((event.clientX-lastHover.x)/18,-1,1),THREE.MathUtils.clamp((lastHover.y-event.clientY)/18,-1,1));
      pointerSeen=true;lastHover.set(event.clientX,event.clientY);setPointer(event.clientX,event.clientY);
      const hit=raycaster.intersectObjects(cards.filter(card=>card.visible))[0];hovered=(hit?.object as THREE.Mesh)??null;
      if(hit?.uv)hoverUv.copy(hit.uv);
      if(hovered)lastInput=performance.now();
      return;
    }
    hovered=null;const dx=event.clientX-down.x;if(Math.abs(dx)>5||Math.abs(event.clientY-down.y)>5)moved=true;target=down.target-dx/Math.max(85,width*.11);lastInput=performance.now();
  };
  const pointerLeave=()=>{hovered=null;pointerSeen=false;lastInput=performance.now();};
  const pointerUp=(event:PointerEvent)=>{if(!down)return;if(!moved)open(event);else target=Math.round(target);down=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);};
  const cancel=()=>{down=null;};
  const wheel=(event:WheelEvent)=>{event.preventDefault();event.stopPropagation();if(opening)return;lastInput=performance.now();target+=(event.deltaY+event.deltaX)*.004;};
  const fail=(event:Event)=>{event.preventDefault();lost=true;delete host.dataset.workGl;};
  host.addEventListener("pointerdown",pointerDown);host.addEventListener("pointermove",pointerMove);host.addEventListener("pointerup",pointerUp);host.addEventListener("pointercancel",cancel);host.addEventListener("wheel",wheel,{passive:false});canvas.addEventListener("webglcontextlost",fail);
  host.addEventListener("pointerleave",pointerLeave);
  host.dataset.workGl="true";gsap.ticker.add(tick);
  return { go(index:number){if(opening)return;lastInput=performance.now();target=projects.length<3?index:Math.round(target)+modulo(index-modulo(Math.round(target),projects.length)+projects.length/2,projects.length)-projects.length/2;},
    dispose(){host.removeEventListener("pointerleave",pointerLeave);gsap.killTweensOf(launch);delete host.dataset.opening;gsap.ticker.remove(tick);observer.disconnect();host.removeEventListener("pointerdown",pointerDown);host.removeEventListener("pointermove",pointerMove);host.removeEventListener("pointerup",pointerUp);host.removeEventListener("pointercancel",cancel);host.removeEventListener("wheel",wheel);canvas.removeEventListener("webglcontextlost",fail);delete host.dataset.workGl;geometry.dispose();lineGeometry.dispose();arcGeometry.dispose();lineMaterial.dispose();arcMaterial.dispose();materials.forEach(value=>value.dispose());textures.forEach(texture=>texture.dispose());renderer.dispose();scene.clear();},
  };
}
