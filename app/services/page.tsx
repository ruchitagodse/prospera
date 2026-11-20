import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/services");

export default function ServicesPage() {
  return <ExperienceShell initialPage="services"/>;
}
