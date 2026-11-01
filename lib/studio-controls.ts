import * as THREE from "three";

/** Free look and dolly controls, confined to the room's interaction surface. */
export function createStudioControls(root: HTMLElement, hitLogo: (x: number, y: number) => boolean = () => false) {
  const surface = root.querySelector<HTMLElement>(".p-room-interaction");
  const position = new THREE.Vector3(0, 3.1, 11);
  const destination = position.clone(), home = position.clone();
  const pose = { position, yaw: 0, pitch: -.1, explored: false, interacting: false, mood: 0, pressed: 0, hovering: false };
  const moods = ["Daylight", "Golden hour", "After hours"];
  const status = root.querySelector<HTMLElement>("#p-room-status");
  const moodLabel = root.querySelector<HTMLElement>("[data-room-mood-label]");
  let mood = 0, view = 0;
  let gesture: { x: number; y: number; yaw: number; pitch: number; logo: boolean; moved: boolean; multi: boolean } | null = null;
  let yaw = 0, pitch = -.1, homePitch = -.1, homeYaw = 0, explored = false, pinch = 0;
  const pointers = new Map<number, { x: number; y: number }>();
  const forward = new THREE.Vector3(), candidate = new THREE.Vector3();
  let lastState = "";
  const allowed = () => root.dataset.intro === "complete" && root.dataset.overlay !== "true" && root.querySelector<HTMLElement>(".p-page-stage")?.dataset.page === "home";
  const announce = (message: string) => { if (status) status.textContent = message; };
  const release = () => {
    gesture = null; const ids = [...pointers.keys()]; pointers.clear(); pinch = 0; pose.hovering = false;
    if (surface) { surface.dataset.dragging = "false"; surface.dataset.logoHover = "false"; surface.dataset.control = "idle"; ids.forEach(id => { if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id); }); }
  };
  const setMood = (next: number) => {
    mood = next; pose.mood = mood;
    if (surface) surface.dataset.light = moods[mood].toLowerCase().replaceAll(" ", "-");
    if (moodLabel) moodLabel.textContent = moods[mood];
    announce(`${moods[mood]} lighting. Drag the logo to shift the room view.`);
  };
  const changeLight = () => setMood((mood + 1) % moods.length);
  const moveTo = (delta: THREE.Vector3) => {
    candidate.copy(destination).add(delta);
    candidate.x = THREE.MathUtils.clamp(candidate.x, -14.5, 14.5);
    candidate.y = THREE.MathUtils.clamp(candidate.y, .7, 14.5);
    candidate.z = THREE.MathUtils.clamp(candidate.z, -13, 15);
    if (candidate.y < 4 && Math.hypot(candidate.x, candidate.z - .8) < 2.8) return;
    destination.copy(candidate); explored = true;
  };
  const travel = (amount: number) => {
    forward.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    moveTo(forward.multiplyScalar(THREE.MathUtils.clamp(amount, -1.6, 1.6)));
  };
  const reset = () => { destination.copy(home); yaw = homeYaw; pitch = homePitch; explored = false; view = 0; release(); setMood(0); announce("Room view and daylight lighting restored."); };
  const changeView = () => {
    view = (view + 1) % 4; destination.copy(home); yaw = [homeYaw, .55, 1.1, -2.05][view]; pitch = view ? -.08 : homePitch; explored = view !== 0;
    announce(`${["Original", "Desk", "Window", "Lounge"][view]} room view. Press Home to return.`);
  };
  const pinchDistance = () => { const pair = [...pointers.values()]; return pair.length < 2 ? 0 : Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y); };
  const down = (event: PointerEvent) => {
    if (!allowed() || event.button !== 0) return;
    event.preventDefault(); surface?.focus({ preventScroll: true });
    surface?.setPointerCapture(event.pointerId);
    if (!pointers.size) gesture = { x: event.clientX, y: event.clientY, yaw, pitch, logo: hitLogo(event.clientX, event.clientY), moved: false, multi: false };
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size > 1 && gesture) gesture.multi = true;
    if (surface) surface.dataset.dragging = "true";
    if (surface) surface.dataset.control = gesture?.logo ? "logo" : "room";
    pinch = pinchDistance();
  };
  const move = (event: PointerEvent) => {
    if (!allowed()) return;
    const previous = pointers.get(event.pointerId);
    if (!previous) {
      pose.hovering = event.pointerType !== "touch" && hitLogo(event.clientX, event.clientY);
      if (surface) surface.dataset.logoHover = String(pose.hovering);
      return;
    }
    event.preventDefault();
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 7) gesture.moved = true;
    if (pointers.size >= 2) { const distance = pinchDistance(); travel((distance-pinch)*.025); pinch = distance; }
    else if (gesture?.moved || !gesture?.logo) {
      if (gesture?.logo) {
        yaw = THREE.MathUtils.clamp(gesture.yaw - (event.clientX - gesture.x) * .0026, gesture.yaw - .45, gesture.yaw + .45);
        pitch = THREE.MathUtils.clamp(gesture.pitch - (event.clientY - gesture.y) * .0018, gesture.pitch - .18, gesture.pitch + .18);
      } else { yaw -= dx*.0026; pitch = THREE.MathUtils.clamp(pitch-dy*.0022, -1.1, 1.1); }
      explored = true;
    }
  };
  const up = (event: PointerEvent) => {
    const tap = allowed() && pointers.has(event.pointerId) && pointers.size === 1 && gesture?.logo && !gesture.moved && !gesture.multi && event.type === "pointerup" && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) <= 7;
    pointers.delete(event.pointerId); pinch = pinchDistance();
    if (!pointers.size) { gesture = null; if (surface) { surface.dataset.dragging = "false"; surface.dataset.control = "idle"; } }
    if (tap) { if (event.shiftKey) changeView(); else changeLight(); }
    if (surface?.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
  };
  const wheel = (event: WheelEvent) => {
    if (!allowed()) return;
    event.preventDefault(); event.stopPropagation();
    const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1);
    travel(-pixels*.006);
  };
  const keys = (event: KeyboardEvent) => {
    if (!allowed()) return;
    const key = event.key.toLowerCase();
    if (!["arrowleft","arrowright","arrowup","arrowdown","w","a","s","d","+","=","-","home","escape","enter"," ","l","v"].includes(key)) return;
    event.preventDefault(); explored = true;
    if (["enter", " ", "l", "v"].includes(key)) { if (!event.repeat) { if (key === "v") changeView(); else changeLight(); } return; }
    if (key === "arrowleft") yaw += .16;
    if (key === "arrowright") yaw -= .16;
    if (key === "arrowup") pitch = Math.min(1.35,pitch+.13);
    if (key === "arrowdown") pitch = Math.max(-1.35,pitch-.13);
    if (["w","+","="].includes(key)) travel(.8);
    if (["s","-"].includes(key)) travel(-.8);
    if (key === "a" || key === "d") moveTo(forward.set(Math.cos(yaw),0,-Math.sin(yaw)).multiplyScalar(key === "a" ? -.7 : .7));
    if (key === "home" || key === "escape") reset();
  };
  const resetButton = root.querySelector<HTMLButtonElement>(".p-room-reset");
  const closer = root.querySelector<HTMLButtonElement>(".p-room-closer");
  const farther = root.querySelector<HTMLButtonElement>(".p-room-farther");
  const goCloser = () => travel(1), goFarther = () => travel(-1);
  const leave = () => { if (!pointers.size) { pose.hovering = false; if (surface) surface.dataset.logoHover = "false"; } };
  if (surface) surface.dataset.light = "daylight";
  surface?.addEventListener("pointerdown",down); surface?.addEventListener("pointermove",move);
  surface?.addEventListener("pointerup",up); surface?.addEventListener("pointercancel",up);
  surface?.addEventListener("lostpointercapture",up); surface?.addEventListener("wheel",wheel,{passive:false});
  surface?.addEventListener("keydown",keys); window.addEventListener("blur",release);
  surface?.addEventListener("pointerleave",leave);
  resetButton?.addEventListener("click",reset); closer?.addEventListener("click",goCloser); farther?.addEventListener("click",goFarther);
  return {
    setHome(value: THREE.Vector3, angle: number, heading = 0) { home.copy(value); homePitch = angle; homeYaw = heading; if (!explored) { destination.copy(home); position.copy(home); yaw=heading;pitch=angle;pose.yaw=heading;pose.pitch=angle; } },
    update(dt: number) {
      const smooth=1-Math.exp(-Math.min(dt,.05)*7);
      pose.explored = explored;
      pose.interacting = pointers.size > 0 || Math.abs(yaw-pose.yaw) > .002 || Math.abs(pitch-pose.pitch) > .002 || position.distanceToSquared(destination) > .0004;
      position.lerp(destination,smooth); pose.yaw+=(yaw-pose.yaw)*smooth; pose.pitch+=(pitch-pose.pitch)*smooth;
      pose.pressed += ((gesture?.logo && pointers.size === 1 ? 1 : 0) - pose.pressed) * smooth;
      const state=[pose.yaw,pose.pitch,position.x,position.y,position.z].map(value=>value.toFixed(2)).join(",");
      if(surface&&state!==lastState){lastState=state;surface.dataset.view=state;surface.dataset.explored=String(explored);}
      if(!allowed()&&pointers.size)release();
      return pose;
    },
    dispose() {
      release();surface?.removeEventListener("pointerdown",down);surface?.removeEventListener("pointermove",move);
      surface?.removeEventListener("pointerup",up);surface?.removeEventListener("pointercancel",up);surface?.removeEventListener("lostpointercapture",up);
      surface?.removeEventListener("wheel",wheel);surface?.removeEventListener("keydown",keys);window.removeEventListener("blur",release);
      surface?.removeEventListener("pointerleave",leave);
      resetButton?.removeEventListener("click",reset);closer?.removeEventListener("click",goCloser);farther?.removeEventListener("click",goFarther);
      if(surface){delete surface.dataset.view;delete surface.dataset.explored;delete surface.dataset.light;delete surface.dataset.logoHover;delete surface.dataset.control;}
    },
  };
}
