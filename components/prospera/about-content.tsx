import { AboutSpotlight } from "./about-spotlight";

export function AboutContent({ active, reduced }: { active: boolean; reduced: boolean }) {
  return <div className="p-about p-about-scene"><AboutSpotlight active={active} reduced={reduced}/></div>;
}
