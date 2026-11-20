import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1155182980245442');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* Meta's tracking beacon must remain a plain image without optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1155182980245442&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <WebsiteVisitsProvider>{children}</WebsiteVisitsProvider>
      </body>
    </html>
  );
}
