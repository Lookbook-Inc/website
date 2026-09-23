import { Metadata } from "next"
import { ClientProviders } from "./client-providers"

export const metadata: Metadata = {
  title: "Lookbook Style Snapshot - Your Outfits in Review",
  description: "What's your style aesthetic? See how you dress with this photo album recap.",
  openGraph: {
    title: "Lookbook Style Snapshot",
    description: "What's your style aesthetic?",
    type: "website",
    siteName: "Lookbook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook Style Snapshot",
    description: "What's your style aesthetic?",
  },
}

export default function WrappedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientProviders>{children}</ClientProviders>
}
