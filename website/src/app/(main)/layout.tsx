import type { Metadata } from "next";
import { MainClientProviders } from "./client-providers";

export const metadata: Metadata = {
  title: "Lookbook - Home",
  description: "Lookbook: Your Style Anthology.",
  openGraph: {
    title: "Lookbook - Home",
    description: "Lookbook: Your Style Anthology.",
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
    title: "Lookbook - Home",
    description: "Lookbook: Your Style Anthology.",
    images: ["/images/unfurl-card.jpg"],
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainClientProviders>
      {children}
    </MainClientProviders>
  );
}

