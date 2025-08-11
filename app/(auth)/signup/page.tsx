import Link from "next/link";
import { AuthForm } from "../../components/auth-form";

export const metadata = {
  title: "Sign up | GlobalTrotters",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-white">Create your account</h1>
        <AuthForm mode="signup" />
        <p className="text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-red-400 hover:text-red-300 underline transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}
