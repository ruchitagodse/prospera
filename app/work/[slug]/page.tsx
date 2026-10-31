import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExperienceShell from "@/components/prospera/experience-shell";
import { workProjects } from "@/content/work";

export function generateStaticParams() {
  return workProjects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = workProjects.find(project => project.slug === slug);
  if (!project) notFound();
  return { title: `${project.title} | PROSPERA`, description: project.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!workProjects.some(project => project.slug === slug)) notFound();
  return <ExperienceShell initialPage="work" initialProject={slug}/>;
}
