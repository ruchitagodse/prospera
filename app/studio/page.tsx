import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/studio");

export default function StudioPage() {
  return <ExperienceShell initialPage="studio"/>;
}
