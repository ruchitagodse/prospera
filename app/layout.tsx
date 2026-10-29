import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROSPERA | Digital Studio in Mumbai",
  description: "Websites, stores, apps and content made with care for growing businesses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      {/* Extensions such as Grammarly add body attributes before hydration. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
