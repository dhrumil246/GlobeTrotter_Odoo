import Link from "next/link";
import { AuthForm } from "../../components/auth-form";
import ShootingStars from "@/app/components/RotatingGlobe";

export const metadata = {
  title: "Sign up | GlobalTrotters",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black relative">
      {/* Shooting Stars Background - Full Screen */}
      <div className="absolute inset-0 z-0">
        <ShootingStars />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex h-screen">
        {/* Left Side - Form (Exactly half width, full height) */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-lg mx-auto">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-500/20 rounded-xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-white mb-8">Create Account</h2>
              <p className="text-gray-300 mb-8">Join GlobalTrotters and start your journey</p>
              <AuthForm mode="signup" />
              
              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Empty space for visual balance */}
        <div className="w-1/2 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">GlobalTrotters</h1>
            <p className="text-xl text-gray-300">Your journey begins here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
