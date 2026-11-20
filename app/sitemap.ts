import type { MetadataRoute } from "next";
import { pageSeo, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.keys(pageSeo)
    .filter(path => path !== "/studio")
    .map(path => ({ url: new URL(path, siteUrl).href }));
}
