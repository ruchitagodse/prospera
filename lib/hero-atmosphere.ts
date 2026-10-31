/** Moving light and touch ripples share the site's existing animation ticker. */
export function createHeroAtmosphere(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>('.p-hero');
  if (!hero) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'p-hero-atmosphere';
  canvas.setAttribute('aria-hidden', 'true');
  hero.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return null; }
  let width = 1, height = 1, active = false;
  const pointer = { x: -1000, y: -1000 };
  const rings: { x: number; y: number; age: number }[] = [];
  const resize = () => {
    width = hero.clientWidth; height = hero.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const observer = new ResizeObserver(resize); observer.observe(hero); resize();
  const move = (event: PointerEvent) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    active = root.dataset.intro === 'complete' && root.dataset.overlay !== 'true';
  };
  const down = (event: PointerEvent) => {
    move(event);
    if (!active || (event.target instanceof Element && event.target.closest('a,button'))) return;
    if (rings.length >= 6) rings.shift();
    rings.push({ x: pointer.x, y: pointer.y, age: 0 });
  };
  const leave = () => { active = false; };
  const up = (event: PointerEvent) => { if (event.pointerType !== 'mouse') leave(); };
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerdown', down, { passive: true });
  hero.addEventListener('pointerleave', leave);
  hero.addEventListener('pointerup', up);
  hero.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);
  return {
    render(time: number, delta: number) {
      const rect = hero.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > innerHeight || root.dataset.intro !== 'complete') return;
      const dt = Math.min(delta, .033);
      const dark = root.dataset.theme === 'dark';
      ctx.clearRect(0, 0, width, height);
      // Large, slow light fields keep the room alive even without input.
      ctx.save();
      ctx.globalCompositeOperation = dark ? 'screen' : 'multiply';
      for (let i = 0; i < 3; i++) {
        const cx = width * (.25 + i * .29) + Math.sin(time * .19 + i * 2) * width * .13;
        const cy = height * (.32 + Math.sin(time * .23 + i) * .2);
        const radius = Math.max(width, height) * (.32 + i * .06);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, `rgba(197,157,83,${dark ? .13 : .085})`);
        glow.addColorStop(.45, `rgba(215,186,124,${dark ? .06 : .035})`);
        glow.addColorStop(1, 'rgba(215,186,124,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
      // Soft ribbons of reflected light drift across the floor, below the copy.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 7; i++) {
        const y = height * (.62 + i * .045);
        ctx.beginPath();
        for (let x = width * .43; x <= width; x += 18) {
          const wave = Math.sin(x / width * 13 + time * .8 + i * .7) * (7 + i * 2);
          const py = y + wave + Math.sin(time * .35 + i) * 9;
          if (x === width * .43) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        }
        ctx.strokeStyle = `rgba(241,215,155,${.035 + (.5 + .5 * Math.sin(time * .7 + i)) * .065})`;
        ctx.lineWidth = 2 + i * .7;
        ctx.stroke();
      }
      ctx.restore();
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i]; ring.age += dt;
        if (ring.age > 1.5) { rings.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(202,166,99,${(1 - ring.age / 1.5) * .3})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ring.x, ring.y, 8 + ring.age * 110, 0, Math.PI * 2); ctx.stroke();
      }
    },
    dispose() {
      observer.disconnect(); canvas.remove(); window.removeEventListener('blur', leave);
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerdown', down);
      hero.removeEventListener('pointerleave', leave); hero.removeEventListener('pointerup', up);
      hero.removeEventListener('pointercancel', leave);
    },
  };
}
