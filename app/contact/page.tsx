import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/contact");

export default function ContactPage() {
  return <ExperienceShell initialPage="contact"/>;
}
