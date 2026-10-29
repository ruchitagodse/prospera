import gsap from "gsap";

/** Nested word/letter transforms keep the entrance separate from live wind. */
export function assembleLoader(root: HTMLElement, reduced: boolean) {
  const context = gsap.context(() => {
    gsap.fromTo(".p-loader-center p", { autoAlpha: 0, y: reduced ? 0 : 8 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .8, delay: reduced ? 0 : 1.5 });
  }, root);
  return () => context.revert();
}

export function revealExperience(root: HTMLElement, reduced: boolean, onUncovered: () => void, onComplete: () => void) {
  const loader = root.querySelector(".p-loader");
  const words = root.querySelectorAll(".p-hero h1 .p-word");
  const art = root.querySelector(".p-art");
  const extras = root.querySelectorAll(".p-header, .p-hero-top, .p-intro, .p-hero-bottom");
  const context = gsap.context(() => {
    const timeline = gsap.timeline({ onComplete });
    gsap.set([words, ...extras], { autoAlpha: 0 });
    if (reduced) {
      timeline.to(loader, { autoAlpha: 0, duration: .15 });
      timeline.call(onUncovered);
      timeline.set([words, art, ...extras], { autoAlpha: 1, clearProps: "transform" });
      return;
    }
    const canvas = root.querySelector<HTMLCanvasElement>(".p-gl");
    // Resolve the hero camera in its final slot before uncovering it. Moving the
    // loader canvas across the page made the sculpture cross the headline.
    if (canvas && art) timeline.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8, ease: "power2.out" }, .35);
    timeline.to(".p-loader-center, .p-loader-bottom, .p-loader-top", {
      x: 65, autoAlpha: 0, duration: .55, ease: "power3.in",
    }, 0);
    timeline.to(loader, {
      autoAlpha: 0,
      duration: .85, ease: "power2.inOut",
    }, .12);
    timeline.fromTo(".p-header, .p-hero-top", { y: -12 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .08 }, .55);
    timeline.fromTo(words, { yPercent: 115, rotation: 4 }, {
      yPercent: 0, rotation: 0, autoAlpha: 1, duration: .95, stagger: .065, ease: "power3.out",
    }, .68);
    timeline.call(onUncovered, [], 1.05);
    timeline.fromTo(".p-intro", { y: 16 }, { y: 0, autoAlpha: 1, duration: .8 }, 1.75);
    timeline.fromTo(".p-hero-bottom", { y: 8 }, { y: 0, autoAlpha: 1, duration: .7 }, 2.05);
  }, root);
  return () => context.revert();
}
