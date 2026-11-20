import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/about");

export default function AboutPage() {
  return <ExperienceShell initialPage="studio"/>;
}
