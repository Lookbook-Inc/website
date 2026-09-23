import { logout } from "@/app/auth-actions";
import { AuthShell } from "@/components/auth-shell";

export default function AccessPendingPage() {
  return (
    <AuthShell eyebrow="Limited release" title="Edits isn’t open for this account yet">
      <p className="auth-intro">Your Lookbook account is valid. We’re simply rolling web access out in small groups.</p>
      <form action={logout}><button className="button secondary wide">Sign out</button></form>
    </AuthShell>
  );
}
