"use client";

import { useEffect, useRef } from "react";

const steps = [
  ["Discover", "Understand the business, requirements and challenges."],
  ["Plan", "Define the right strategy and solution."],
  ["Build", "Design, develop, test and refine."],
  ["Deliver", "Launch the solution and provide support."],
];

export function WorkProcess({ active, reduced }: { active: boolean; reduced: boolean }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active || reduced || !root.current) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.setAttribute("data-visible", "true"); observer.unobserve(entry.target); }
    }), { threshold: .15 });
    const items = root.current.querySelectorAll("li");
    items.forEach(item => { item.setAttribute("data-visible", "false"); observer.observe(item); });
    return () => { observer.disconnect(); items.forEach(item => item.removeAttribute("data-visible")); };
  }, [active, reduced]);
  return <section ref={root} className="p-process" aria-labelledby="process-heading">
    <div className="p-process-heading"><div><span className="p-editorial-index">How we work</span><h2 id="process-heading">From your first idea.<br/><em>To what comes next.</em></h2></div><p>A clear process. Close collaboration.<br/>Thoughtful work at every step.</p></div>
    <ol>{steps.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
    <a className="p-editorial-link" href="#contact">Start a conversation <span>↗</span></a>
  </section>;
}
