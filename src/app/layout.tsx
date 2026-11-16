import type { Metadata, Viewport } from "next";
import { Anybody, Schibsted_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";

const sans = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

// Display face: a variable width axis (50–150%) the hero and plates bend with the cursor.
const display = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = "Ahmad Bhanvadiya — Developer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  authors: [{ name: site.name, url: site.github }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  // Dark is the default theme; a visitor's own choice is restored before paint.
  themeColor: "#0f0f0d",
  colorScheme: "dark light",
};

// Runs before paint: dark by default, or the visitor's saved choice; flags JS for motion.
const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');var t='dark';try{var s=localStorage.getItem('theme');if(s==='light'||s==='dark')t=s}catch(e){}d.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#0f0f0d':'#f0ece2')})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
