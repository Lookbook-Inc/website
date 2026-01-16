import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lookbook - Home",
  description: "Studio Maven Inc. presents - Lookbook: Your Style Anthology.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}

