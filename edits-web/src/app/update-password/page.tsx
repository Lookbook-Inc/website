import { updatePassword } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function UpdatePasswordPage() {
  return (
    <AuthShell eyebrow="Account recovery" title="Choose a new password">
      <p className="auth-intro">Use at least eight characters.</p>
      <AuthForm action={updatePassword} mode="update" />
    </AuthShell>
  );
}
