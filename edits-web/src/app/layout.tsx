import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lookbook Edits", template: "%s · Lookbook Edits" },
  description: "Your wardrobe, outfits, fit pics, and latest Lookbook recommendations.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><Analytics>{children}</Analytics></body></html>;
}
