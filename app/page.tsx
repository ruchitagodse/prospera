import { createPageMetadata } from "@/lib/seo";
import ExperienceShell from "@/components/prospera/experience-shell";

export const metadata = createPageMetadata("/");

export default function Home() {
  return <ExperienceShell />;
}
