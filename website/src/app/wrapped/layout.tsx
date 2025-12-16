import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "../globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lookbook Wrapped - Your Fashion Year in Review",
  description: "Discover your unique fashion journey with Lookbook Wrapped.",
};

export default function WrappedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      {children}
    </div>
  );
}
