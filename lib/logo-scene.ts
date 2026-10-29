import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { Frame } from "@/lib/motion-engine";
import { createArchitecturalStudio } from "@/lib/architectural-studio";

/** Opening and hero share a sculpture and the application's ticker. */
export function createScene(root: HTMLElement) {
  const canvas=root.querySelector<HTMLCanvasElement>(".p-gl"), source=root.querySelector<SVGSVGElement>(".p-main-mark"), art=root.querySelector<HTMLElement>(".p-art");
  const hero=root.querySelector<HTMLElement>(".p-hero");
  if (!canvas || !source || !art || !hero) return null;
  let renderer: THREE.WebGLRenderer;
  try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true}); } catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.autoClear=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  const studio=createArchitecturalStudio(renderer,root);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(34,1,1,3000), logo=new THREE.Group(); scene.add(logo);
  const face=new THREE.MeshPhysicalMaterial({color:0x37332a,metalness:.72,roughness:.3,clearcoat:.35});
  const gold=new THREE.MeshPhysicalMaterial({color:0xd6ad62,metalness:.78,roughness:.24,clearcoat:.45});
  const sides=new THREE.MeshStandardMaterial({color:0x82602d,metalness:.7,roughness:.35});
  const svg=source.cloneNode(true) as SVGElement;
  svg.querySelectorAll("path").forEach(p=>p.setAttribute("fill",p.getAttribute("fill")==="currentColor"?"#24241f":"#c6a263"));
  const parts:{mesh:THREE.Mesh;delay:number}[]=[], surface:number[]=[], seeds:number[]=[];
  try {
    new SVGLoader().parse(new XMLSerializer().serializeToString(svg)).paths.forEach(path=>{
      const arrow=path.color.getHex()===0xc6a263;
      path.toShapes().forEach(shape=>{
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:22,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:1,bevelThickness:1.3,curveSegments:24});
        geometry.computeBoundingBox(); const bounds=geometry.boundingBox!;
        if(bounds.min.y>420){geometry.dispose();return;}
        const delay=arrow?0:bounds.min.x>345?.7+(bounds.min.x-345)*.003:1.25;
        geometry.translate(-372,-312,-11);
        const mesh=new THREE.Mesh(geometry,[arrow?gold:face,sides]); mesh.scale.y=-1;logo.add(mesh);parts.push({mesh,delay});
        const positions=geometry.getAttribute("position"),normals=geometry.getAttribute("normal");
        for(let i=0;i<positions.count;i+=3){
          if(normals.getZ(i)<.9)continue;
          const a=new THREE.Vector3().fromBufferAttribute(positions,i),b=new THREE.Vector3().fromBufferAttribute(positions,i+1),c=new THREE.Vector3().fromBufferAttribute(positions,i+2);
          const count=Math.ceil(b.clone().sub(a).cross(c.clone().sub(a)).length()/12);
          for(let j=0;j<count;j++){let u=Math.random(),v=Math.random();if(u+v>1){u=1-u;v=1-v;}const p=a.clone().addScaledVector(b.clone().sub(a),u).addScaledVector(c.clone().sub(a),v);surface.push(p.x,-p.y,p.z+2+Math.random()*5);seeds.push(Math.random(),delay);}
        }
      });
    });
  } catch {studio.dispose();renderer.dispose();face.dispose();gold.dispose();sides.dispose();parts.forEach(({mesh})=>mesh.geometry.dispose());return null;}
  const ambient=new THREE.AmbientLight(0xffedcf,1.25);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xffe2a0,5);key.position.set(-180,280,350);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,3);rim.position.set(250,80,-80);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xfff4df,2);fill.position.set(160,-100,250);scene.add(fill);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(surface,3));geometry.setAttribute("aSeed",new THREE.Float32BufferAttribute(seeds,2));
  const offsets=new Float32Array(surface.length), velocities=new Float32Array(surface.length);
  const offsetAttribute=new THREE.BufferAttribute(offsets,3).setUsage(THREE.DynamicDrawUsage);geometry.setAttribute("aOffset",offsetAttribute);
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uAge:{value:0},uFinish:{value:0},uOpacity:{value:1},uPixelRatio:{value:renderer.getPixelRatio()},uTouch:{value:new THREE.Vector3()},uTouchStrength:{value:0}},
    vertexShader:`attribute vec2 aSeed;attribute vec3 aOffset;uniform float uTime,uAge,uFinish,uPixelRatio,uTouchStrength;uniform vec3 uTouch;varying float vAlpha;varying float vGlint;
    void main(){vec3 p=position+aOffset;float born=smoothstep(aSeed.y,aSeed.y+1.,uAge);float lift=smoothstep(1.,35.,length(aOffset));
    p+=vec3(sin(aSeed.x*70.)*35.,-25.,30.)*(1.-born);
    float breath=pow(.5+.5*sin(uTime*.48),3.);
    p+=born*vec3(sin(uTime*.65+position.y*.026+aSeed.x*50.),cos(uTime*.52+position.x*.024+aSeed.x*63.),sin(uTime*.6+aSeed.x*40.))*(3.+breath*9.);
    float dist=length(position.xy-uTouch.xy);
    float touch=exp(-dist*dist/15000.)*uTouchStrength*born;
    float ripple=sin(dist*.035-uTime*3.);
    p.xy+=normalize(position.xy-uTouch.xy+vec2(.01))*touch*(12.+ripple*14.);
    p.z+=touch*(18.+ripple*12.);
    float wave=sin(position.y*.035-uTime*1.1+position.x*.014);
    float glint=pow(.5+.5*sin(uTime*1.8+aSeed.x*100.),7.);
    float sweep=clamp((position.x+155.)/315.,0.,1.);
    float finish=smoothstep(sweep*.65,sweep*.65+.35,uFinish);
    p+=vec3(sin(aSeed.x*90.)*14.,cos(aSeed.x*75.)*14.,22.)*(1.-finish);
    vGlint=glint;vAlpha=born*finish*(.38+.4*glint+.16*wave+lift*.2);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.1+aSeed.x*2.+glint*1.2+lift)*uPixelRatio;}`,
    fragmentShader:`uniform float uOpacity;varying float vAlpha;varying float vGlint;void main(){float d=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.12,1.,d);vec3 color=mix(vec3(.72,.48,.16),vec3(1.,.94,.72),vGlint);gl_FragColor=vec4(color,a*vAlpha*uOpacity);}`});
  const logoParticles = new THREE.Points(geometry,material);
  logo.add(logoParticles);
  let lost=false,started:number|null=null,heroStarted:number|null=null,bufferWidth=0,bufferHeight=0,layoutSignature="";
  const pointer=new THREE.Vector3(),direction=new THREE.Vector3(),lastPointer=new THREE.Vector2(900,900);
  const pointerVelocity=new THREE.Vector2();let pointerActive=false;
  const input={x:innerWidth/2,y:innerHeight/2};
  const activate=(event:PointerEvent)=>{pointerActive=true;input.x=event.clientX;input.y=event.clientY;};
  const deactivate=()=>{pointerActive=false;lastPointer.set(900,900);};
  window.addEventListener("pointermove",activate,{passive:true});window.addEventListener('pointerdown',activate,{passive:true});window.addEventListener('pointerup',deactivate,{passive:true});document.addEventListener("pointerleave",deactivate);window.addEventListener("blur",deactivate);
  // Use the displayed canvas aspect, including its entrance transform. The drawing
  // buffer follows layout size only, avoiding allocations during the transition.
  const measure=(r:DOMRect)=>{const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight);if(w!==bufferWidth||h!==bufferHeight){renderer.setSize(w,h,false);bufferWidth=w;bufferHeight=h;}
    const aspect=r.width/Math.max(1,r.height);if(Math.abs(camera.aspect-aspect)>.0001||camera.position.z===0){camera.aspect=aspect;camera.position.z=Math.max(245,315/aspect)/(2*Math.tan(THREE.MathUtils.degToRad(17)))*1.12;camera.updateProjectionMatrix();}};
  const fail=(event:Event)=>{event.preventDefault();lost=true;art.dataset.gl="false";delete hero.dataset.room;};canvas.addEventListener("webglcontextlost",fail);art.dataset.gl="true";
  return {
    capture() {
      if (lost || root.dataset.intro !== "complete" || hero.getBoundingClientRect().width === 0) return null;
      renderer.clear(); studio.render();
      return canvas.toDataURL("image/png");
    },
    render(frame:Frame){
      if(lost)return;if(started===null)started=frame.time;const age=frame.time-started,dark=root.dataset.intro==="waiting"||root.dataset.theme==="dark";
      face.color.setHex(dark?0x544936:0x2c2922);
      parts.forEach(({mesh,delay})=>{const t=THREE.MathUtils.smoothstep(age,delay,delay+1.1);mesh.scale.set(1,-Math.max(.001,t),1);mesh.position.y=(1-t)*-35;});
      const complete=root.dataset.intro!=="waiting";
      if (complete && heroStarted === null) heroStarted = frame.time;
      const particleReveal = complete ? THREE.MathUtils.smoothstep(frame.time-(heroStarted??frame.time),.5,2.4) : 0;
      logoParticles.visible = particleReveal > 0;
      const entryBlend=Number(root.dataset.logoBlend??1);
      const finish=Number(root.dataset.logoFinish??1);
      // Matte-to-metal light response changes over the same interval as the
      // travelling particle reveal; opacity alone cannot soften that change.
      face.metalness=THREE.MathUtils.lerp(.05,.72,finish);
      face.roughness=THREE.MathUtils.lerp(.85,.3,finish);
      face.clearcoat=.35*finish;
      gold.metalness=THREE.MathUtils.lerp(.08,.78,finish);
      gold.roughness=THREE.MathUtils.lerp(.8,.24,finish);
      gold.clearcoat=.45*finish;
      sides.metalness=THREE.MathUtils.lerp(.08,.7,finish);
      material.uniforms.uFinish.value=finish;
      for(const surfaceMaterial of [face,gold,sides]){
        if(!surfaceMaterial.transparent){surfaceMaterial.transparent=true;surfaceMaterial.needsUpdate=true;}
        surfaceMaterial.opacity=entryBlend;
      }
      logo.rotation.set(complete?-.08+Math.sin(frame.time*.35)*.025-frame.y*.06:-.08-frame.y*.2,complete?-.24+Math.sin(frame.time*.28)*.055+frame.x*.1:-.24+frame.x*.4,Math.sin(frame.time*.3)*.012);
      logo.position.y=Math.sin(frame.time*.5)*3;
      material.uniforms.uTime.value=frame.time;material.uniforms.uAge.value=age;material.uniforms.uOpacity.value=.92*entryBlend*particleReveal;
      const heroRect=hero.getBoundingClientRect();
      if(complete&&(heroRect.width===0||heroRect.bottom<0||heroRect.top>innerHeight))return;
      const artRect=art.getBoundingClientRect();
      if(complete){
        const layout=[heroRect.width,heroRect.height,heroRect.left-artRect.left,heroRect.top-artRect.top];
        const signature=layout.join(":");
        if(signature!==layoutSignature){layoutSignature=signature;["--scene-width","--scene-height","--scene-left","--scene-top"].forEach((key,i)=>art.style.setProperty(key,`${layout[i]}px`));}
        hero.dataset.room="true";
      }
      const r=complete?artRect:canvas.getBoundingClientRect();measure(r);
      let pointerOnLogo=true;
      if(complete){
        studio.mountLogo(logo,[ambient,key,rim,fill]);
        studio.update(frame,bufferWidth,bufferHeight,{x:artRect.left-heroRect.left,y:artRect.top-heroRect.top,width:artRect.width,height:artRect.height},dark);
        pointerOnLogo=studio.localPointer((input.x-heroRect.left)/bufferWidth*2-1,-((input.y-heroRect.top)/bufferHeight*2-1),logo,pointer);
      }else{
        pointer.set(((frame.x+.5)*innerWidth-r.left)/r.width*2-1,-(((frame.y+.5)*innerHeight-r.top)/r.height*2-1),.5).unproject(camera);
        direction.copy(pointer).sub(camera.position).normalize();pointer.copy(camera.position).addScaledVector(direction,-camera.position.z/direction.z);logo.updateMatrixWorld();logo.worldToLocal(pointer);
      }
      const dt=Math.min(frame.dt,.025),interactive=pointerActive&&pointerOnLogo&&root.dataset.overlay!=="true";
      const touchActive=pointerActive&&pointerOnLogo&&root.dataset.overlay!=="true";
      material.uniforms.uTouch.value.lerp(pointer,1-Math.exp(-dt*9));
      material.uniforms.uTouchStrength.value+=((touchActive?1:0)-material.uniforms.uTouchStrength.value)*(1-Math.exp(-dt*5));
      if(interactive&&lastPointer.x!==900){pointerVelocity.set((pointer.x-lastPointer.x)/Math.max(dt,.001),(pointer.y-lastPointer.y)/Math.max(dt,.001)).clampLength(0,650);}else pointerVelocity.set(0,0);
      if(interactive)lastPointer.set(pointer.x,pointer.y);
      for(let i=0;i<surface.length;i+=3){
        const dx=surface[i]+offsets[i]-pointer.x,dy=surface[i+1]+offsets[i+1]-pointer.y;
        const influence=interactive?Math.pow(Math.max(0,1-Math.hypot(dx,dy)/65),2):0;
        // A shared curl field creates coherent ribbons; the spring returns each
        // particle to its original surface location when the pointer passes.
        const phase=(surface[i]+surface[i+1])*.018-frame.time*1.8;
        const curlX=Math.cos(phase)*70,curlY=Math.sin(phase)*70;
        velocities[i]+=(influence*(pointerVelocity.x*5+curlX*3)-offsets[i]*13-velocities[i]*5)*dt;
        velocities[i+1]+=(influence*(pointerVelocity.y*5+curlY*3)-offsets[i+1]*13-velocities[i+1]*5)*dt;
        velocities[i+2]+=(influence*160-offsets[i+2]*13-velocities[i+2]*5)*dt;
        for(let axis=0;axis<3;axis++)offsets[i+axis]=THREE.MathUtils.clamp(offsets[i+axis]+velocities[i+axis]*dt,-90,90);
      }
      offsetAttribute.needsUpdate=true;
      key.position.x=complete?-180:-180+frame.x*220;
      renderer.setScissorTest(false);renderer.setViewport(0,0,bufferWidth,bufferHeight);renderer.clear();
      if(complete)studio.render();else renderer.render(scene,camera);
    },
    dispose(){window.removeEventListener("pointermove",activate);window.removeEventListener('pointerdown',activate);window.removeEventListener('pointerup',deactivate);document.removeEventListener("pointerleave",deactivate);window.removeEventListener("blur",deactivate);canvas.removeEventListener("webglcontextlost",fail);delete art.dataset.gl;delete hero.dataset.room;studio.dispose();parts.forEach(({mesh})=>mesh.geometry.dispose());geometry.dispose();material.dispose();face.dispose();gold.dispose();sides.dispose();renderer.dispose();},
  };
}
