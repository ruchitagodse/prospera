import { pageSeo } from "@/lib/seo";

// The animated experience uses the History API without a Next.js route render.
export function syncPageMetadata() {
  const path = window.location.pathname;
  const seo = pageSeo[path];
  if (!seo) return;
  document.title = seo.title;
  for (const [selector, content] of [
    ['meta[name="description"]', seo.description],
    ['meta[property="og:title"]', seo.title],
    ['meta[property="og:description"]', seo.description],
    ['meta[name="twitter:title"]', seo.title],
    ['meta[name="twitter:description"]', seo.description],
  ]) {
    document.head.querySelector(selector)?.setAttribute("content", content);
  }
  const canonicalPath = path === "/studio" ? "/about" : path;
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  // Preserve the configured production origin when previewing on localhost.
  const origin = canonical ? new URL(canonical.href).origin : location.origin;
  const url = new URL(canonicalPath, origin).href;
  canonical?.setAttribute("href", url);
  document.head.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
}
