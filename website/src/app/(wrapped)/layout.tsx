import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lookbook Wrapped - Your Fashion Year in Review",
  description: "Discover your unique fashion journey with Lookbook Wrapped.",
};

export default function WrappedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
