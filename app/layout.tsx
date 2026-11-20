import type { Metadata } from "next";
import "./globals.css";
import { createPageMetadata, siteUrl } from "@/lib/seo";
import { WebsiteVisitsProvider } from "@/components/prospera/website-visits";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...createPageMetadata("/"),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "K26LHSjb7dud6l3IRhlM6bVKOsrUzbWsMXjMcZ6WbDg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      {/* Extensions such as Grammarly add body attributes before hydration. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning><WebsiteVisitsProvider>{children}</WebsiteVisitsProvider></body>
    </html>
  );
}
