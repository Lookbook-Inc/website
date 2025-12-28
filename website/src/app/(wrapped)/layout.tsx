import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lookbook Wrapped - Your Outfits in Review",
  description: "What was your aesthetic this year? See how you dressed with this photo album recap.",
  openGraph: {
    title: "Lookbook Wrapped",
    description: "What was your aesthetic this year?",
    type: "website",
    siteName: "Lookbook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook Wrapped",
    description: "What was your aesthetic this year?",
  },
};

export default function WrappedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
