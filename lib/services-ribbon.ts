import * as THREE from "three";
import { createServicePoster } from "./service-poster";
import { serviceOfferings } from "@/content/site";

export type RibbonController = { move: (direction: number) => void; focus: (slot: number) => void; dispose: () => void };
export { createServicePoster } from "./service-poster";


export function createServicesRibbon(host: HTMLElement, slots: HTMLElement[], reduced: boolean, progress: (value: number) => void): RibbonController {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,1,1,3000); camera.position.z=1000;
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className="p-services-canvas";renderer.domElement.setAttribute("aria-hidden","true");host.prepend(renderer.domElement);
  const posters=serviceOfferings.map((_,i)=>createServicePoster(i));
  slots.forEach((slot, index) => { const fallback=slot.querySelector<HTMLElement>(".p-ribbon-fallback");if(fallback){fallback.style.backgroundImage=`url(${posters[index%posters.length].image})`;fallback.dataset.poster="true";} });
  const geometry=new THREE.PlaneGeometry(1,1,32,12);
  const materials=slots.map((_,i)=>new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{map:{value:posters[i%posters.length].texture},viewport:{value:1},speed:{value:0},hover:{value:0},time:{value:0}},vertexShader:`varying vec2 vUv; uniform float viewport; uniform float speed; void main(){vUv=uv;vec4 p=modelMatrix*vec4(position,1.);float bend=p.x/viewport;p.z+=bend*bend*460.;p.y+=bend*bend*150.;p.z+=sin(uv.x*3.14159)*clamp(speed,-35.,35.)*1.5;p.y+=sin(uv.x*3.14159)*speed*.22;gl_Position=projectionMatrix*viewMatrix*p;}`,fragmentShader:`uniform sampler2D map;uniform float hover;uniform float time;varying vec2 vUv;float random(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 q=abs(vUv-.5)-vec2(.455,.47);float rounded=length(max(q,0.))-0.04;if(rounded>0.)discard;vec2 cell=floor(vUv*vec2(6.,9.));float r=random(cell);float block=step(r,hover*.72)*step(.18,r);vec4 ink=texture2D(map,vUv);ink.rgb=mix(ink.rgb,vec3(.065,.073,.056),block*.96);gl_FragColor=ink;#include <tonemapping_fragment>\n#include <colorspace_fragment>}` }));
  // Shader directives must start on their own line for WebGL's preprocessor.
  materials.forEach(material => { material.fragmentShader = material.fragmentShader.replace(";#include", ";\n#include"); });
  const meshes=materials.map((m)=>{const mesh=new THREE.Mesh(geometry,m);scene.add(mesh);return mesh;});
  let width=1,height=1,cardWidth=240,pitch=254,maxHeight=400,target=0,current=0,previous=0,frame=0,lastTime=0,lastPoster=0,dragging=false,lastX=0,dragDistance=0,hovered=-1,visible=false;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const resize=()=>{width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;const desiredWidth=width<700?width*.76:width<1100?Math.min(300,width*.3):Math.min(320,width*.2);const labelSpace=width<700?80:112;cardWidth=Math.min(desiredWidth,Math.max(170,(height-labelSpace)/1.52));pitch=cardWidth+(width<700?18:22);maxHeight=cardWidth*1.52;camera.aspect=width/height;camera.fov=2*Math.atan(height/2000)*180/Math.PI;camera.updateProjectionMatrix();renderer.setSize(width,height);};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(host);resize();
  const move=(direction:number)=>{target+=direction*pitch;};
  const focus=(slot:number)=>{const x=meshes[slot]?.position.x??0;target+=x;};
  const wheel=(e:WheelEvent)=>{if(e.ctrlKey)return;e.preventDefault();target+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.85;};
  const down=(e:PointerEvent)=>{if((e.target as HTMLElement).closest(".p-service-back"))return;dragging=true;lastX=e.clientX;dragDistance=0;host.dataset.dragging="true";};
  const pointerMove=(e:PointerEvent)=>{if(dragging){const dx=lastX-e.clientX;target+=dx;dragDistance+=Math.abs(dx);lastX=e.clientX;}const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/width*2-1,-(e.clientY-rect.top)/height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(meshes)[0];hovered=hit?meshes.findIndex(mesh => mesh === hit.object):-1;};
  const up=()=>{dragging=false;host.dataset.dragging="false";};
  const click=(e:MouseEvent)=>{if(dragDistance>7){e.preventDefault();e.stopPropagation();}dragDistance=0;};
  host.addEventListener("wheel",wheel,{passive:false});host.addEventListener("pointerdown",down);window.addEventListener("pointermove",pointerMove);window.addEventListener("pointerup",up);host.addEventListener("click",click,true);
  const render=(now:number)=>{
    frame=requestAnimationFrame(render);if(!visible||!width||!height||document.hidden){lastTime=now;return;}
    const dt=Math.min((now-lastTime)/16.667,2)||1;lastTime=now;
    current+=(target-current)*(reduced?1:1-Math.pow(.91,dt));const speed=(current-previous)/dt;previous=current;
    const count=slots.length,total=count*pitch;const time=reduced?0:now*.001;
    if(now-lastPoster>50){posters.forEach(p=>p.draw(time));lastPoster=now;}
    meshes.forEach((mesh,i)=>{
      const x=THREE.MathUtils.euclideanModulo((i-Math.floor(slots.length/2))*pitch-current+total/2,total)-total/2;
      const ratio=[.82,.94,1,.94,.82][i%5],h=maxHeight*ratio;
      mesh.visible=Math.abs(x)<width*.85;
      mesh.scale.set(cardWidth,h,1);mesh.position.set(x,(maxHeight-h)/2-(width<700?8:24),0);
      const bendWidth=Math.max(width,1000);
      materials[i].uniforms.viewport.value=bendWidth;materials[i].uniforms.speed.value=reduced?0:speed;
      materials[i].uniforms.hover.value+=((hovered===i&&!dragging&&!reduced?1:0)-materials[i].uniforms.hover.value)*.075*dt;
      const projection=new THREE.Vector3(x,mesh.position.y+Math.pow(x/bendWidth,2)*150,Math.pow(x/bendWidth,2)*460).project(camera);
      const scale=1000/(1000-Math.pow(x/bendWidth,2)*460),left=(projection.x+1)*width/2,top=(-projection.y+1)*height/2;
      const slot=slots[i];slot.style.width=`${cardWidth*scale}px`;slot.style.height=`${h*scale}px`;slot.style.transform=`translate3d(${left-cardWidth*scale/2}px,${top-h*scale/2}px,0)`;slot.style.opacity=Math.abs(x)<width*.78?"1":"0";slot.style.pointerEvents=Math.abs(x)<width*.78?"auto":"none";slot.style.setProperty("--label-visible",top-h*scale/2-44>=2?"visible":"hidden");
    });
    progress(THREE.MathUtils.euclideanModulo(current,pitch*posters.length)/(pitch*posters.length));renderer.render(scene,camera);
  };frame=requestAnimationFrame(render);
  return {move,focus,dispose(){cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();host.removeEventListener("wheel",wheel);host.removeEventListener("pointerdown",down);window.removeEventListener("pointermove",pointerMove);window.removeEventListener("pointerup",up);host.removeEventListener("click",click,true);geometry.dispose();materials.forEach(m=>m.dispose());posters.forEach(p=>p.texture.dispose());renderer.dispose();renderer.domElement.remove();slots.forEach(s=>{s.removeAttribute("style");});}};
}
