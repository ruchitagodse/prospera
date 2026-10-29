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
          const count=Math.ceil(b.clone().sub(a).cross(c.clone().sub(a)).length()/18);
          for(let j=0;j<count;j++){let u=Math.random(),v=Math.random();if(u+v>1){u=1-u;v=1-v;}const p=a.clone().addScaledVector(b.clone().sub(a),u).addScaledVector(c.clone().sub(a),v);surface.push(p.x,-p.y,p.z+1.5);seeds.push(Math.random(),delay);}
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
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uAge:{value:0},uOpacity:{value:1},uPixelRatio:{value:renderer.getPixelRatio()}},
    vertexShader:`attribute vec2 aSeed;attribute vec3 aOffset;uniform float uTime,uAge,uPixelRatio;varying float vAlpha;
    void main(){vec3 p=position+aOffset;float born=smoothstep(aSeed.y,aSeed.y+1.,uAge);float lift=smoothstep(1.,35.,length(aOffset));
    p+=vec3(sin(aSeed.x*70.)*35.,-25.,30.)*(1.-born);
    float glint=pow(.5+.5*sin(uTime*1.8+aSeed.x*100.),5.);
    vAlpha=born*(.25+.65*glint+lift*.2);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.3+aSeed.x*2.3+lift*1.5;}`,
    fragmentShader:`uniform float uOpacity;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.15,1.,d);gl_FragColor=vec4(1.,.72,.28,a*vAlpha*uOpacity);}`});
  logo.add(new THREE.Points(geometry,material));
  let lost=false,started:number|null=null,bufferWidth=0,bufferHeight=0,layoutSignature="";
  const pointer=new THREE.Vector3(),direction=new THREE.Vector3(),lastPointer=new THREE.Vector2(900,900);
  const pointerVelocity=new THREE.Vector2();let pointerActive=false;
  const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
  const activate=(event:PointerEvent)=>{if(event.pointerType!=="touch")pointerActive=true;};
  const deactivate=()=>{pointerActive=false;lastPointer.set(900,900);};
  window.addEventListener("pointermove",activate,{passive:true});document.addEventListener("pointerleave",deactivate);window.addEventListener("blur",deactivate);
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
      logo.rotation.set(complete?-.08:-.08-frame.y*.2,complete?-.24:-.24+frame.x*.4,complete?0:Math.sin(frame.time*.3)*.012);
      logo.position.y=complete?0:Math.sin(frame.time*.65)*3;
      material.uniforms.uTime.value=frame.time;material.uniforms.uAge.value=age;material.uniforms.uOpacity.value=complete?0:dark?.95:.8;
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
        pointerOnLogo=studio.localPointer(((frame.x+.5)*innerWidth-heroRect.left)/bufferWidth*2-1,-(((frame.y+.5)*innerHeight-heroRect.top)/bufferHeight*2-1),logo,pointer);
      }else{
        pointer.set(((frame.x+.5)*innerWidth-r.left)/r.width*2-1,-(((frame.y+.5)*innerHeight-r.top)/r.height*2-1),.5).unproject(camera);
        direction.copy(pointer).sub(camera.position).normalize();pointer.copy(camera.position).addScaledVector(direction,-camera.position.z/direction.z);logo.updateMatrixWorld();logo.worldToLocal(pointer);
      }
      const dt=Math.min(frame.dt,.025),interactive=fine&&pointerActive&&pointerOnLogo&&root.dataset.overlay!=="true";
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
    dispose(){window.removeEventListener("pointermove",activate);document.removeEventListener("pointerleave",deactivate);window.removeEventListener("blur",deactivate);canvas.removeEventListener("webglcontextlost",fail);delete art.dataset.gl;delete hero.dataset.room;studio.dispose();parts.forEach(({mesh})=>mesh.geometry.dispose());geometry.dispose();material.dispose();face.dispose();gold.dispose();sides.dispose();renderer.dispose();},
  };
}
