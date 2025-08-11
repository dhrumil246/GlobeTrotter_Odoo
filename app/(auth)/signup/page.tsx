import Link from "next/link";
import { AuthForm } from "../../components/auth-form";

export const metadata = {
  title: "Sign up | GlobalTrotters",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <AuthForm mode="signup" />
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
