import * as THREE from "three";
import type { Frame } from "@/lib/motion-engine";
import { createStudioControls } from "@/lib/studio-controls";

/** The room uses the logo renderer, keeping architecture and sculpture on one canvas. */
export function createArchitecturalStudio(renderer: THREE.WebGLRenderer, root: HTMLElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 120);
  // The brand has its own fixed view; only the architecture follows exploration.
  const logoCamera = new THREE.PerspectiveCamera(40, 1, .1, 120);
  logoCamera.rotation.order = "YXZ"; logoCamera.layers.set(1);
  camera.rotation.order = "YXZ"; camera.layers.enable(1);
  const controls = createStudioControls(root);
  const architecture = new THREE.Group(); scene.add(architecture);
  const sculpture = new THREE.Group(); architecture.add(sculpture);
  sculpture.position.set(0,2.1,.8); sculpture.scale.setScalar(.0148);
  const plaster = new THREE.MeshStandardMaterial({ color: 0xe4dfd3, roughness: .95 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: .87 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xc4bba9, roughness: .8 });
  const alcove = new THREE.MeshStandardMaterial({ color: 0xaca18e, roughness: 1 });
  const materials = [plaster, floorMaterial, stone, alcove];
  // The canvas entrance owns the fade; keep room shading stable throughout it.
  materials.forEach(material => { material.transparent = false; material.opacity = 1; });
  const geometries: THREE.BufferGeometry[] = [];
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true;
    architecture.add(object); return object;
  };

  // A true opening through a deep plaster wall, with a recessed back surface.
  const wall = new THREE.Shape();
  wall.moveTo(-17, 0); wall.lineTo(17, 0); wall.lineTo(17, 16); wall.lineTo(-17, 16); wall.closePath();
  const opening = new THREE.Path();
  opening.moveTo(-6.5, 0); opening.lineTo(-6.5, 1.4);
  opening.absarc(0, 1.4, 6.5, Math.PI, 0, true);
  opening.lineTo(6.5, 0); opening.closePath(); wall.holes.push(opening);
  mesh(new THREE.ExtrudeGeometry(wall, { depth: .65, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 3, curveSegments: 64 }), plaster, 0, 0, -14.5);
  mesh(new THREE.BoxGeometry(18, 16, .2), alcove, 0, 8, -18);
  const floor = mesh(new THREE.PlaneGeometry(100, 160), floorMaterial, 0, -.025, 0);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  mesh(new THREE.BoxGeometry(.3, 16, 34), plaster, -16, 8, .5);
  mesh(new THREE.BoxGeometry(.3, 16, 34), plaster, 16, 8, .5);
  mesh(new THREE.BoxGeometry(32, .25, 34), plaster, 0, 16, .5);
  mesh(new THREE.BoxGeometry(32, 16, .3), plaster, 0, 8, 17);
  // Quiet architectural details are reserved for the return view.
  mesh(new THREE.BoxGeometry(5.5, 7, .12), alcove, 0, 5, 16.78);
  mesh(new THREE.BoxGeometry(4.6, 6.1, .14), stone, 0, 5, 16.66);
  const lightSlot = new THREE.MeshBasicMaterial({color:0xffe9bc});
  for(const x of [-7,0,7]) mesh(new THREE.BoxGeometry(.12,.04,24),lightSlot,x,15.85,0);

  const plinth = new THREE.Group(); architecture.add(plinth);
  const addPlinth = (radius: number, height: number, y: number, material: THREE.Material) => {
    const object = mesh(new THREE.CylinderGeometry(radius, radius, height, 96), material, 0, y, .8);
    architecture.remove(object); plinth.add(object); return object;
  };
  addPlinth(1.92, .16, .08, stone);

  // A furnished room surrounds the sculpture, with the centre kept open.
  const furnitureStart = architecture.children.length;
  const wood = new THREE.MeshStandardMaterial({color:0xa17c48,roughness:.75});
  const charcoal = new THREE.MeshStandardMaterial({color:0x303a32,roughness:.85});
  const leaf = new THREE.MeshStandardMaterial({color:0x657452,roughness:.95});
  const screen = new THREE.MeshStandardMaterial({color:0xc4ddce,emissive:0x93b9a0,emissiveIntensity:.35,roughness:.5});
  materials.push(wood,charcoal,leaf,screen);
  mesh(new THREE.BoxGeometry(6,.22,2.4),wood,5.8,2.1,-7);
  for(const x of [3.3,8.3]) mesh(new THREE.BoxGeometry(.22,2.1,1.9),charcoal,x,1.05,-7);
  mesh(new THREE.BoxGeometry(2.7,1.8,.2),charcoal,5.8,3.5,-7.5);
  mesh(new THREE.BoxGeometry(2.48,1.55,.04),screen,5.8,3.5,-7.37);
  mesh(new THREE.BoxGeometry(.16,.55,.15),charcoal,5.8,2.55,-7.5);
  mesh(new THREE.BoxGeometry(.8,.08,.55),charcoal,5.8,2.25,-7.5);
  mesh(new THREE.BoxGeometry(1.6,.07,.55),stone,5.8,2.26,-6.5);
  // Rounded chair, wall shelves and a gently swaying leafy plant.
  mesh(new THREE.BoxGeometry(1.5,.25,1.4),charcoal,5.8,1.15,-4.6);
  mesh(new THREE.CapsuleGeometry(.65,.65,4,12),charcoal,5.8,1.9,-4);
  mesh(new THREE.CylinderGeometry(.09,.09,1,12),wood,5.8,.55,-4.6);
  for(const y of [5.1,6.6]) {
    mesh(new THREE.BoxGeometry(5.8,.14,.7),wood,5.8,y,-10);
    for(let i=0;i<7;i++) mesh(new THREE.BoxGeometry(.24,.6+(i%3)*.15,.4),i%2?stone:charcoal,3.7+i*.4,y+.4,-10);
  }
  const plantStart=architecture.children.length;
  mesh(new THREE.CylinderGeometry(.65,.48,1,24),stone,-4.8,.5,-6);
  mesh(new THREE.CylinderGeometry(.06,.09,3.3,10),wood,-4.8,2,-6);
  const leaves: THREE.Mesh[]=[];
  for(let i=0;i<12;i++) {
    const angle=i*2.4;
    const item=mesh(new THREE.SphereGeometry(1,16,10),leaf,-4.8+Math.sin(angle)*.7,1.5+i*.22,-6+Math.cos(angle)*.6);
    item.scale.set(.65,.12,.3);item.rotation.set(.2,angle,.5);leaves.push(item);
  }
  const plantParts=architecture.children.slice(plantStart);
  const lamp=mesh(new THREE.SphereGeometry(.38,20,12),wood,8,3.3,-6.8);lamp.scale.y=.55;
  mesh(new THREE.CylinderGeometry(.045,.045,1.2,10),charcoal,8,2.7,-7);
  const glow=new THREE.PointLight(0xffd391,12,9,2);glow.position.set(8,3,-6.6);architecture.add(glow);

  // Reserve a wide, uninterrupted space around the brand sculpture.
  architecture.children.slice(furnitureStart).forEach(object => {
    object.position.x = object.position.x > 0 ? object.position.x - 18 : object.position.x - 3.5;
    object.position.z -= 2;
  });
  // Repeating wall fins and warm recessed bands give the room depth at its edges.
  for(let i=0;i<15;i++) {
    mesh(new THREE.BoxGeometry(.08,8,.3),wood,9+i*.4,4,-14);
    mesh(new THREE.BoxGeometry(.08,8,.3),wood,-9-i*.4,4,-14);
  }
  for(const x of [-11]) {
    mesh(new THREE.BoxGeometry(6,.08,.08),lightSlot,x,.16,-13.7);
    mesh(new THREE.BoxGeometry(6,.08,.08),lightSlot,x,8.5,-13.7);
    const pool = new THREE.PointLight(0xffd49a,16,15,2);
    pool.position.set(x,5,-12); architecture.add(pool);
  }
  const pendants: THREE.Mesh[]=[];
  const pendantPositions = [-13,-9,-5];
  for(const [i,x] of pendantPositions.entries()) {
    const y=7+i*.45;
    mesh(new THREE.CylinderGeometry(.018,.018,8-y,8),charcoal,x,y+(8-y)/2,-8);
    const shade=mesh(new THREE.SphereGeometry(.45,24,16),wood,x,y,-8);
    shade.scale.set(1,.45,1);pendants.push(shade);
    const bulb=new THREE.PointLight(0xffd8a0,8,10,2);bulb.position.set(x,y-.3,-8);architecture.add(bulb);
  }
  // Fine floating motes make the ambient movement visible without moving the logo.
  const dustGeometry=new THREE.BufferGeometry();
  const dustPositions=new Float32Array(150*3);
  for(let i=0;i<150;i++) {
    dustPositions[i*3]=(Math.sin(i*127.1)*.5+.5)*10-15;
    dustPositions[i*3+1]=(Math.sin(i*37.7)*.5+.5)*10;
    dustPositions[i*3+2]=-12+(Math.sin(i*71.3)*.5+.5)*8;
  }
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));geometries.push(dustGeometry);
  const dustMaterial=new THREE.PointsMaterial({color:0xcda86a,size:.025,transparent:true,opacity:.35,depthWrite:false});
  const dust=new THREE.Points(dustGeometry,dustMaterial);architecture.add(dust);

  // Furnish the perimeter at several depths; the logo keeps its clear right-hand bay.
  const fabric = new THREE.MeshStandardMaterial({color:0xb6aa91,roughness:1});
  const windowGlass = new THREE.MeshStandardMaterial({color:0xe5ddbf,emissive:0xe8d4a5,emissiveIntensity:.28,roughness:.65});
  materials.push(fabric,windowGlass);
  const rug=mesh(new THREE.PlaneGeometry(9,6),fabric,-9,.012,-2);
  rug.rotation.x=-Math.PI/2;
  // Window mullions and recessed panels on the far left wall.
  const windowParts: THREE.Object3D[]=[];
  const windowStart=architecture.children.length;
  mesh(new THREE.BoxGeometry(5.8,5,.1),windowGlass,-10.5,4.6,-14);
  for(const x of [-13.4,-11.5,-9.5,-7.6]) mesh(new THREE.BoxGeometry(.07,5.1,.16),wood,x,4.6,-13.88);
  for(const y of [2.1,4.6,7.1]) mesh(new THREE.BoxGeometry(5.9,.07,.16),wood,-10.5,y,-13.88);
  windowParts.push(...architecture.children.slice(windowStart));
  // Low lounge furniture gives the foreground scale.
  const loungeStart=architecture.children.length;
  mesh(new THREE.BoxGeometry(3.8,.55,1.8),fabric,-10,.8,-1.5);
  mesh(new THREE.BoxGeometry(3.8,1.25,.4),fabric,-10,1.5,-2.2);
  for(const x of [-11.7,-8.3]) mesh(new THREE.BoxGeometry(.4,.75,1.8),fabric,x,1.25,-1.5);
  mesh(new THREE.CylinderGeometry(1.1,1.1,.12,48),wood,-7.5,.75,1);
  mesh(new THREE.CylinderGeometry(.28,.4,.7,24),stone,-7.5,.35,1);
  // Books, a ceramic vase and a small plant on the coffee table.
  mesh(new THREE.BoxGeometry(.65,.09,.45),charcoal,-7.7,.87,1);
  mesh(new THREE.BoxGeometry(.6,.07,.42),wood,-7.66,.95,1);
  mesh(new THREE.SphereGeometry(.18,20,12),stone,-7,.98,1);
  const loungeParts=architecture.children.slice(loungeStart);
  loungeParts.push(rug);
  // Move the lounge to the return wall, away from the work desk.
  loungeParts.forEach(object=>{
    object.position.x+=17;
    object.position.z+=10;
  });
  // The sofa back faces the return wall: rotate the whole lounge around its
  // seating centre so the cushions face into the room, with the back flush.
  loungeParts.forEach(object=>{
    const dx=object.position.x-7;
    const dz=object.position.z-8.5;
    object.position.x=7-dx;
    object.position.z=15.55-dz;
    object.rotation.y+=Math.PI;
  });
  const loungeLight=new THREE.PointLight(0xffd7a0,9,12,2);
  loungeLight.position.set(10,3,14);architecture.add(loungeLight);
  // Framed geometric art above the seating.
  for(let i=0;i<3;i++) {
    const x=5+i*1.35;
    mesh(new THREE.BoxGeometry(1.05,1.5,.09),wood,x,5.3,16.7).rotation.y=Math.PI;
    mesh(new THREE.BoxGeometry(.9,1.35,.04),fabric,x,5.3,16.63).rotation.y=Math.PI;
    const motif=mesh(new THREE.CircleGeometry(.3,32),i%2?charcoal:stone,x,5.4,16.6);
    motif.rotation.y=Math.PI;
    motif.scale.y=1.4;
  }
  // Fine floor joints and high ceiling beams span the space without crossing the mark.
  for(let i=0;i<9;i++) {
    mesh(new THREE.BoxGeometry(.014,.006,26),stone,-16+i*2,.004,-2);
  }
  for(const x of [-12,-8,-4,0,4,8,12]) mesh(new THREE.BoxGeometry(.12,.16,30),stone,x,10,-1);
  const windowLight=new THREE.PointLight(0xffe1a4,22,22,2);
  windowLight.position.set(-10,5,-11);architecture.add(windowLight);

  const curtainMaterial=new THREE.MeshStandardMaterial({color:0xd2c3a6,roughness:1,side:THREE.DoubleSide});
  materials.push(curtainMaterial);
  const curtains=[-13.1,-7.9].map(x=>{
    const geometry=new THREE.PlaneGeometry(1.25,5.2,16,24);
    const curtain=mesh(geometry,curtainMaterial,x,4.55,-13.65);
    windowParts.push(curtain);
    return {geometry,base:new Float32Array(geometry.attributes.position.array)};
  });
  // Wrap the windows and curtains onto the side wall instead of stacking them
  // behind the desk. This is visible when exploring across the room.
  const windowBay=new THREE.Group();architecture.add(windowBay);
  windowBay.position.set(-15.7,0,1);
  windowBay.rotation.y=Math.PI/2;
  windowParts.forEach(object=>{
    architecture.remove(object);
    object.position.x+=10.5;
    object.position.z+=14;
    windowBay.add(object);
  });
  // An isolated floor plant balances the return side of the room.
  plantParts.forEach(object=>{object.position.x+=20;object.position.z+=14;});
  const screenInk=new THREE.MeshBasicMaterial({color:0x486c5b});
  const screenRows=Array.from({length:5},(_,i)=>{
    const row=mesh(new THREE.BoxGeometry(1.2-i*.12,.065,.015),screenInk,-12.5,4.05-i*.24,-9.33);
    return row;
  });
  const leafHomes=leaves.map(item=>item.position.clone());

  scene.add(new THREE.HemisphereLight(0xfffbf2, 0xb8b1a2, 2));
  const sunlight = new THREE.DirectionalLight(0xfff6e6, .85);
  // Broad, even illumination avoids diagonal wall shadows behind the mark.
  sunlight.position.set(-3, 12, 10); sunlight.castShadow = false;
  sunlight.shadow.mapSize.set(1024, 1024);
  sunlight.shadow.camera.left = -14; sunlight.shadow.camera.right = 14;
  sunlight.shadow.camera.top = 12; sunlight.shadow.camera.bottom = -10;
  sunlight.shadow.normalBias = .035; sunlight.shadow.bias = -.00015;
  sunlight.shadow.blurSamples = 8;
  scene.add(sunlight); scene.add(sunlight.target);
  const bounce = new THREE.DirectionalLight(0xffffff, .5); bounce.position.set(6, 3, 5); scene.add(bounce);
  const home = new THREE.Vector3();
  const parallax=new THREE.Vector2();
  const daylightMaterial=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{time:{value:0},strength:{value:.14}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform float time,strength;void main(){float edge=smoothstep(0.,.15,vUv.x)*(1.-smoothstep(.75,1.,vUv.x))*smoothstep(0.,.15,vUv.y)*(1.-smoothstep(.8,1.,vUv.y));float bands=pow(.5+.5*sin(vUv.x*36.+vUv.y*6.+sin(time*.18)*1.8),8.);gl_FragColor=vec4(1.,.84,.53,bands*edge*strength);}',
  });
  const daylight=mesh(new THREE.PlaneGeometry(16,18),daylightMaterial,-7,.025,-5);
  daylight.rotation.x=-Math.PI/2;daylight.rotation.z=-.28;
  // Screen-space clearing keeps architecture out of the logo's silhouette,
  // including while the room camera is being explored.
  const quietScene=new THREE.Scene();
  const quietCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quietGeometry=new THREE.PlaneGeometry(2,2);
  const quietMaterial=new THREE.ShaderMaterial({
    transparent:true,depthTest:false,depthWrite:false,
    uniforms:{center:{value:new THREE.Vector2(.75,.5)},radius:{value:new THREE.Vector2(.3,.55)},paper:{value:new THREE.Color(0xe9e5dc)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:'varying vec2 vUv;uniform vec2 center;uniform vec2 radius;uniform vec3 paper;void main(){float d=length((vUv-center)/radius);float a=1.-smoothstep(.62,1.15,d);gl_FragColor=vec4(paper,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  });
  quietScene.add(new THREE.Mesh(quietGeometry,quietMaterial));
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(), inverse = new THREE.Matrix4();
  const localRay = new THREE.Ray(), facePlane = new THREE.Plane(new THREE.Vector3(0,0,1),-12.5);
  let signature = "", darkBefore: boolean | null = null;
  let idleMotion = 1;
  let driftPhase = 0;
  dust.visible = false;
  return {
    mountLogo(logo: THREE.Group, lights: THREE.Light[]) {
      if(logo.parent===sculpture)return;
      sculpture.add(logo);logo.traverse(object=>object.layers.set(1));
      lights.forEach(light=>{light.layers.set(1);sculpture.add(light);if(light instanceof THREE.DirectionalLight){sculpture.add(light.target);light.target.position.set(0,0,0);}});
      renderer.shadowMap.needsUpdate=true;
    },
    update(frame: Frame, width: number, height: number, art: { x: number; y: number; width: number; height: number }, dark: boolean) {
      const nextSignature = `${width}:${height}:${art.x}:${art.y}:${art.width}:${art.height}`;
      quietMaterial.uniforms.center.value.set((art.x+art.width*.5)/width,1-(art.y+art.height*.5)/height);
      quietMaterial.uniforms.radius.value.set(art.width*.66/width,art.height*.72/height);
      quietMaterial.uniforms.paper.value.setHex(dark?0x303029:0xe9e5dc);
      if (nextSignature !== signature) {
        signature = nextSignature;
        camera.fov=40;
        camera.aspect=width/Math.max(1,height);
        camera.setViewOffset(width,height,width/2-(art.x+art.width*.5),height/2-(art.y+art.height*.5),width,height);
        camera.updateProjectionMatrix();
        const focal=height/(2*Math.tan(THREE.MathUtils.degToRad(20)));
        const distance=THREE.MathUtils.clamp(focal*4/Math.min(art.width*.77,art.height*.95),7.5,16);
        home.set(0,2.1+distance*.1,.8+distance);
        logoCamera.copy(camera);
        logoCamera.layers.set(1);
        logoCamera.position.copy(home);
        logoCamera.rotation.set(-Math.atan(.1),0,0,"YXZ");
        logoCamera.updateMatrixWorld();
        // Wide architectural framing is independent of the logo's close framing.
        camera.clearViewOffset();
        camera.fov=60;
        camera.updateProjectionMatrix();
        controls.setHome(home,-Math.atan(.1));
        sunlight.target.position.set(0,2,0);
        renderer.shadowMap.needsUpdate = true;
      }
      if (dark !== darkBefore) {
        darkBefore = dark;
        plaster.color.setHex(dark ? 0x303029 : 0xe9e5dc);
        floorMaterial.color.setHex(dark ? 0x292b24 : 0xe2ddd2);
        stone.color.setHex(dark ? 0x3b3e32 : 0xd5cebf);
        alcove.color.setHex(dark ? 0x272a22 : 0xdbd5c8);
        sunlight.intensity = dark ? .65 : .85;
        renderer.shadowMap.needsUpdate = true;
      }
      const pose=controls.update(frame.dt);
      const motionStep = Math.min(frame.dt,.04);
      const drifting = !pose.interacting && root.dataset.overlay !== 'true';
      idleMotion += ((drifting ? 1 : 0) - idleMotion) * (1 - Math.exp(-motionStep * 2));
      driftPhase += motionStep * .24 * idleMotion;
      leaves.forEach((item,i)=>{
        const breeze=Math.sin(frame.time*1.15+i*.45);
        item.rotation.z=.5+breeze*.16;
        item.rotation.x=.2+Math.cos(frame.time*.9+i*.4)*.09;
        item.position.x=leafHomes[i].x+breeze*.12;
      });
      curtains.forEach(({geometry,base},index)=>{
        const position=geometry.attributes.position;
        for(let i=0;i<position.count;i++){
          const x=base[i*3],y=base[i*3+1];
          const freedom=(2.6-y)/5.2;
          position.setZ(i,Math.sin(x*13)*.085+Math.sin(frame.time*1.25+y*1.3+index)*.3*freedom);
          position.setX(i,x+Math.sin(frame.time*.85+y*.7+index)*.08*freedom);
        }
        position.needsUpdate=true;geometry.computeVertexNormals();
      });
      screenRows.forEach((row,i)=>{row.scale.x=.6+.4*(.5+.5*Math.sin(frame.time*1.6-i*.8));});
      windowLight.position.x=-10+Math.sin(frame.time*.24)*1.8;
      windowLight.intensity=22+Math.sin(frame.time*.45)*4;
      daylightMaterial.uniforms.time.value=frame.time;
      daylightMaterial.uniforms.strength.value=(dark?.1:.25)*(1+Math.sin(frame.time*.38)*.22);
      loungeLight.intensity=9+Math.sin(frame.time*.65)*.7;
      screen.emissiveIntensity=.35+Math.sin(frame.time*1.2)*.07;
      glow.intensity=12+Math.sin(frame.time*.7)*.6;
      pendants.forEach((item,i)=>{item.position.x=pendantPositions[i]+Math.sin(frame.time*.35+i)*.035;});
      dust.position.y=Math.sin(frame.time*.16)*.2;dust.rotation.y=Math.sin(frame.time*.1)*.012;
      // A slow camera orbit adds visible depth without changing the brand view.
      const drift=driftPhase;
      const follow=1-Math.exp(-Math.min(frame.dt,.04)*2);
      const canFollow=root.dataset.overlay!=='true';
      parallax.x+=((canFollow?frame.x:0)-parallax.x)*follow;
      parallax.y+=((canFollow?frame.y:0)-parallax.y)*follow;
      camera.position.copy(pose.position);
      camera.position.x+=(Math.sin(drift)*1.05+parallax.x*.35)*idleMotion;
      camera.position.y+=(Math.sin(drift*2)*.17-parallax.y*.1)*idleMotion;
      camera.position.z+=(1-Math.cos(drift))*.2*idleMotion;
      camera.rotation.set(pose.pitch+(Math.sin(drift*2)*.008+parallax.y*.006)*idleMotion,pose.yaw+(Math.sin(drift)*.035-parallax.x*.008)*idleMotion,0,"YXZ");camera.updateMatrixWorld();
    },
    localPointer(x:number,y:number,logo:THREE.Group,point:THREE.Vector3) {
      mouse.set(x,y);raycaster.setFromCamera(mouse,logoCamera);logo.updateWorldMatrix(true,false);
      inverse.copy(logo.matrixWorld).invert();localRay.copy(raycaster.ray).applyMatrix4(inverse);
      return localRay.intersectPlane(facePlane,point)!==null;
    },
    render() {
      // Render the moving room behind the fixed hero sculpture. Clearing depth
      // prevents an explored wall from covering the logo's independent view.
      camera.layers.set(0);renderer.render(scene,camera);
      renderer.render(quietScene,quietCamera);
      renderer.clearDepth();if(root.dataset.logoFlight!=='true')renderer.render(scene,logoCamera);
    },
    dispose() { controls.dispose();daylightMaterial.dispose();geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());quietGeometry.dispose();quietMaterial.dispose();quietScene.clear();screenInk.dispose();dustMaterial.dispose();lightSlot.dispose();sunlight.shadow.dispose();scene.clear(); },
  };
}
