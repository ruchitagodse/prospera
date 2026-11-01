"use client";

import { useEffect, type RefObject } from "react";

export function useAboutMotion(root: RefObject<HTMLDivElement | null>, active: boolean, reduced: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!element || !active || reduced) return;
    const shell = element.closest<HTMLElement>(".prospera");
    const animations = new Set<Animation>();
    let dispose: (() => void) | undefined;

    const start = () => {
      // The opening sequence owns the screen until the visitor enters.
      if (dispose || shell?.dataset.intro !== "complete") return;
      element.dataset.motion = "on";
      const sections = Array.from(element.querySelectorAll<HTMLElement>("section"));
      const revealItems = Array.from(element.querySelectorAll<HTMLElement>(
        ".p-note-top, .p-studio-note h2, .p-note-bottom, .p-founder-sleeve, .p-story-founder-copy > *, .p-story-section-head > *, .p-principle-list article, .p-process-sessions details, .p-studio-invitation > *",
      ));
      const play = (item: HTMLElement) => {
        if (item.dataset.reveal !== "waiting") return;
        delete item.dataset.reveal;
        const siblings = revealItems.filter(other => other.parentElement === item.parentElement);
        const delay = Math.min(siblings.indexOf(item) * 65, 260);
        const animation = item.animate([
          { opacity: 0, translate: "0 28px" },
          { opacity: 1, translate: "0 0" },
        ], { duration: 850, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      };
      const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        play(entry.target as HTMLElement);
        reveals.unobserve(entry.target);
      }), { rootMargin: "0px 0px -32px 0px", threshold: 0 });
      revealItems.forEach(item => { item.dataset.reveal = "waiting"; reveals.observe(item); });
      const visible = new IntersectionObserver(entries => entries.forEach(entry => {
        (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
      }));
      sections.forEach(section => visible.observe(section));

      const sleeve = element.querySelector<HTMLElement>(".p-founder-sleeve");
      let frame = 0;
      const update = () => {
        frame = 0;
        if (!sleeve || document.hidden || shell?.dataset.overlay === "true") return;
        const rect = sleeve.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight));
        sleeve.style.setProperty("--sleeve-shift", `${progress * -24}px`);
      };
      const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !sleeve) return;
        const rect = sleeve.getBoundingClientRect();
        sleeve.style.setProperty("--sleeve-x", `${(event.clientY - rect.top) / rect.height * -8 + 4}deg`);
        sleeve.style.setProperty("--sleeve-y", `${(event.clientX - rect.left) / rect.width * 10 - 5}deg`);
      };
      const reset = () => {
        sleeve?.style.removeProperty("--sleeve-x");
        sleeve?.style.removeProperty("--sleeve-y");
      };
      const focus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        revealItems.filter(item => item.contains(target)).forEach(play);
      };
      window.addEventListener("scroll", scroll, { passive: true });
      window.addEventListener("resize", scroll);
      sleeve?.addEventListener("pointermove", move);
      sleeve?.addEventListener("pointerleave", reset);
      element.addEventListener("focusin", focus);
      scroll();
      dispose = () => {
        reveals.disconnect(); visible.disconnect(); cancelAnimationFrame(frame);
        window.removeEventListener("scroll", scroll);
        window.removeEventListener("resize", scroll);
        sleeve?.removeEventListener("pointermove", move);
        sleeve?.removeEventListener("pointerleave", reset);
        element.removeEventListener("focusin", focus);
        animations.forEach(animation => animation.cancel());
        revealItems.forEach(item => delete item.dataset.reveal);
        sections.forEach(section => delete section.dataset.inView);
        sleeve?.style.removeProperty("--sleeve-shift"); reset();
        delete element.dataset.motion;
      };
    };
    const opening = new MutationObserver(start);
    if (shell) opening.observe(shell, { attributes: true, attributeFilter: ["data-intro"] });
    start();
    return () => { opening.disconnect(); dispose?.(); };
  }, [root, active, reduced]);
}
