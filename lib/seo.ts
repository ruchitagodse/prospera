import type { Metadata } from "next";
import { workProjects } from "@/content/work";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://prosperadigitalstudio.vercel.app").origin;

export const pageSeo: Record<string, { title: string; description: string }> = {
  "/": {
    title: "PROSPERA | Digital Solutions & Creative Studio",
    description: "We build. We simplify. We help businesses grow. Digital presence, business solutions and creative design from PROSPERA, Mumbai.",
  },
  "/about": {
    title: "About Our Studio | PROSPERA",
    description: "Meet PROSPERA, a Mumbai creative and digital studio helping growing businesses with thoughtful design, practical technology and a personal approach.",
  },
  "/studio": {
    title: "Inside the Studio | PROSPERA",
    description: "Explore the thinking behind PROSPERA: a Mumbai studio bringing design, development and business solutions together to build, grow and prosper.",
  },
  "/services": {
    title: "Web Design, Business Solutions & Branding | PROSPERA",
    description: "Explore PROSPERA's website design, business software, UI/UX, branding and social media services, tailored to help your business grow.",
  },
  "/work": {
    title: "Our Work & Digital Projects | PROSPERA",
    description: "Explore PROSPERA's portfolio of websites, business platforms, e-commerce experiences and creative projects, with project details and interface previews.",
  },
  "/contact": {
    title: "Contact Us & Discuss Your Project | PROSPERA",
    description: "Tell PROSPERA about your next website, business solution or branding project. Get in touch with our Mumbai studio to start the conversation.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | PROSPERA",
    description: "How PROSPERA handles project inquiries, personal information, browser preferences and privacy requests.",
  },
  "/terms-of-service": {
    title: "Terms of Service | PROSPERA",
    description: "Read the terms for using the PROSPERA website, submitting inquiries and discussing digital and creative projects.",
  },
  ...Object.fromEntries(workProjects.map(project => [`/work/${project.slug}`, {
    title: `${project.title} | PROSPERA`,
    description: project.description,
  }])),
};

export function createPageMetadata(path: string): Metadata {
  const { title, description } = pageSeo[path];
  const canonical = path === "/studio" ? "/about" : path;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "PROSPERA",
      title,
      description,
      url: canonical,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PROSPERA — Digital solutions and creative design for growing businesses" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
