import Link from "next/link";
import { requestPasswordReset } from "@/app/auth-actions";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Account recovery" title="Reset your password">
      <p className="auth-intro">We’ll send a secure reset link to your Lookbook email.</p>
      <AuthForm action={requestPasswordReset} mode="forgot" />
      <Link className="text-link center" href="/login">Back to sign in</Link>
    </AuthShell>
  );
}
