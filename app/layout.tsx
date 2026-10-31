import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prospera-m35u.vercel.app"),
  title: "PROSPERA | Digital Solutions & Creative Studio",
  description: "We build. We simplify. We help businesses grow. Digital presence, business solutions and creative design from PROSPERA, Mumbai.",
  openGraph: {
    type: "website",
    siteName: "PROSPERA",
    title: "PROSPERA | Digital Solutions & Creative Studio",
    description: "Digital presence, business solutions and creative branding for growing businesses. Thoughtful design and practical technology from Mumbai.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PROSPERA — Digital solutions and creative design for growing businesses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PROSPERA | Digital Solutions & Creative Studio",
    description: "Digital solutions and creative design for growing businesses.",
    images: ["/opengraph-image"],
  },
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
