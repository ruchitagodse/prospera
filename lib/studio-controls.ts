import * as THREE from "three";

/** Free look and dolly controls, confined to the room's interaction surface. */
export function createStudioControls(root: HTMLElement) {
  const surface = root.querySelector<HTMLElement>(".p-room-interaction");
  const position = new THREE.Vector3(0, 3.1, 11);
  const destination = position.clone(), home = position.clone();
  const pose = { position, yaw: 0, pitch: -.1, explored: false, interacting: false };
  let yaw = 0, pitch = -.1, homePitch = -.1, homeYaw = 0, explored = false, pinch = 0;
  const pointers = new Map<number, { x: number; y: number }>();
  const forward = new THREE.Vector3(), candidate = new THREE.Vector3();
  let lastState = "";
  const allowed = () => root.dataset.intro === "complete" && root.dataset.overlay !== "true";
  const release = () => { pointers.clear(); pinch = 0; if (surface) surface.dataset.dragging = "false"; };
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
  const reset = () => { destination.copy(home); yaw = homeYaw; pitch = homePitch; explored = false; release(); };
  const pinchDistance = () => { const pair = [...pointers.values()]; return pair.length < 2 ? 0 : Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y); };
  const down = (event: PointerEvent) => {
    if (!allowed() || event.button !== 0) return;
    event.preventDefault(); surface?.focus({ preventScroll: true });
    surface?.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (surface) surface.dataset.dragging = "true";
    pinch = pinchDistance();
  };
  const move = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId); if (!previous || !allowed()) return;
    event.preventDefault();
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2) { const distance = pinchDistance(); travel((distance-pinch)*.025); pinch = distance; }
    else { yaw -= dx*.0026; pitch = THREE.MathUtils.clamp(pitch-dy*.0022, -1.1, 1.1); explored = true; }
  };
  const up = (event: PointerEvent) => {
    pointers.delete(event.pointerId); pinch = pinchDistance();
    if (!pointers.size && surface) surface.dataset.dragging = "false";
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
    if (!["arrowleft","arrowright","arrowup","arrowdown","w","a","s","d","+","=","-","home","escape"].includes(key)) return;
    event.preventDefault(); explored = true;
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
  surface?.addEventListener("pointerdown",down); surface?.addEventListener("pointermove",move);
  surface?.addEventListener("pointerup",up); surface?.addEventListener("pointercancel",up);
  surface?.addEventListener("lostpointercapture",up); surface?.addEventListener("wheel",wheel,{passive:false});
  surface?.addEventListener("keydown",keys); window.addEventListener("blur",release);
  resetButton?.addEventListener("click",reset); closer?.addEventListener("click",goCloser); farther?.addEventListener("click",goFarther);
  return {
    setHome(value: THREE.Vector3, angle: number, heading = 0) { home.copy(value); homePitch = angle; homeYaw = heading; if (!explored) { destination.copy(home); position.copy(home); yaw=heading;pitch=angle;pose.yaw=heading;pose.pitch=angle; } },
    update(dt: number) {
      const smooth=1-Math.exp(-Math.min(dt,.05)*7);
      pose.explored = explored;
      pose.interacting = pointers.size > 0 || Math.abs(yaw-pose.yaw) > .002 || Math.abs(pitch-pose.pitch) > .002 || position.distanceToSquared(destination) > .0004;
      position.lerp(destination,smooth); pose.yaw+=(yaw-pose.yaw)*smooth; pose.pitch+=(pitch-pose.pitch)*smooth;
      const state=[pose.yaw,pose.pitch,position.x,position.y,position.z].map(value=>value.toFixed(2)).join(",");
      if(surface&&state!==lastState){lastState=state;surface.dataset.view=state;surface.dataset.explored=String(explored);}
      if(!allowed()&&pointers.size)release();
      return pose;
    },
    dispose() {
      release();surface?.removeEventListener("pointerdown",down);surface?.removeEventListener("pointermove",move);
      surface?.removeEventListener("pointerup",up);surface?.removeEventListener("pointercancel",up);surface?.removeEventListener("lostpointercapture",up);
      surface?.removeEventListener("wheel",wheel);surface?.removeEventListener("keydown",keys);window.removeEventListener("blur",release);
      resetButton?.removeEventListener("click",reset);closer?.removeEventListener("click",goCloser);farther?.removeEventListener("click",goFarther);
      if(surface){delete surface.dataset.view;delete surface.dataset.explored;}
    },
  };
}
