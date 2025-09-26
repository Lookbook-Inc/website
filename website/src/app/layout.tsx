import type { Metadata } from "next";
import { DM_Serif_Display, DM_Serif_Text, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
});

const dmSerifText = DM_Serif_Text({
  weight: "400",
  variable: "--font-dm-serif-text",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lookbook - Home",
  description: "Welcome to Your Company. Learn about what we do and meet our team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerifDisplay.variable} ${dmSerifText.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
