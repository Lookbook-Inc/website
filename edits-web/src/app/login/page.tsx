import { login } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <AuthShell eyebrow="Existing members" title="Welcome back">
      <p className="auth-intro">Sign in with the email and password you use in Lookbook.</p>
      {params.message ? <p className="form-message" role="status">{params.message}</p> : null}
      <AuthForm action={login} mode="login" next={params.next} />
      <p className="auth-note">Edits is currently invite-only. New accounts are created in the Lookbook app.</p>
    </AuthShell>
  );
}
