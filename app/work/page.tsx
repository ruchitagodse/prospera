import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/work");

export default function WorkPage() {
  return <ExperienceShell initialPage="work"/>;
}
