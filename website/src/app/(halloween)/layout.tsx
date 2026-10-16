import { Metadata, Viewport } from "next"
import { ClientProviders } from "./client-providers"

export const metadata: Metadata = {
  title: "Lookbook Halloween - Tonight's Looks",
  description: "Snap your costume and see what everyone else is wearing tonight.",
  openGraph: {
    title: "Lookbook Halloween",
    description: "Snap your costume and see what everyone else is wearing tonight.",
    type: "website",
    siteName: "Lookbook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook Halloween",
    description: "Snap your costume and see what everyone else is wearing tonight.",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
}

export default function HalloweenLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientProviders>{children}</ClientProviders>
}
