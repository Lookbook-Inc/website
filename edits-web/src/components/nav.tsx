"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth-actions";
import { NavIcon } from "@/components/icons";

const links = [
  ["Home", "/"],
  ["Wardrobe", "/wardrobe"],
  ["Fit Pics", "/fit-pics"],
  ["Outfits", "/outfits"],
  ["Recommendations", "/recommendations"],
] as const;

function active(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="side-nav">
      <div>
        <Link href="/" className="brand-lockup" aria-label="Lookbook Edits home">
          <span className="wordmark">LOOKBOOK</span><span>Edits</span>
        </Link>
        <nav aria-label="Primary">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={active(pathname, href) ? "active" : ""} aria-current={active(pathname, href) ? "page" : undefined}>
              <NavIcon name={label} /><span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="account-block">
        <span className="account-label">Signed in</span>
        <span className="account-email">{email ?? "Lookbook member"}</span>
        <form action={logout}><button className="nav-button">Sign out</button></form>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="Primary">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className={active(pathname, href) ? "active" : ""} aria-current={active(pathname, href) ? "page" : undefined}>
          <NavIcon name={label} /><span>{label === "Recommendations" ? "Edits" : label}</span>
        </Link>
      ))}
    </nav>
  );
}
