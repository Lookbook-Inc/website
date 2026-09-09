import { MobileNav, SideNav } from "@/components/nav";
import { requireViewer } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return <div className="app-shell"><SideNav email={viewer.email} /><main className="main-content" id="main-content">{children}</main><MobileNav /></div>;
}
