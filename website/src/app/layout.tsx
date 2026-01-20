import type { Metadata } from "next";
import { DM_Serif_Display, DM_Serif_Text, Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Your Style Anthology.",
  openGraph: {
    title: "Lookbook",
    description: "Your Style Anthology.",
    images: [
      {
        url: "/images/unfurl-card.jpg",
        width: 1200,
        height: 630,
        alt: "Lookbook - Your Style Anthology",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook",
    description: "Your Style Anthology.",
    images: ["/images/unfurl-card.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerifDisplay.variable} ${dmSerifText.variable} ${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
