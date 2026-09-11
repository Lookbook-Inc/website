import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: { default: "Lookbook Edits", template: "%s · Lookbook Edits" },
  description: "Generate your own edit. Change the fit, the line, the palette, the song.",
  robots: { index: false, follow: false },
};

/**
 * Applies the stored theme before first paint. Light is the default; without
 * this a member who picked dark would see light first, then a snap on hydration.
 */
const themeScript = `try{var t=localStorage.getItem("lb-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="grain" aria-hidden="true" />
        <Analytics>{children}</Analytics>
      </body>
    </html>
  );
}
