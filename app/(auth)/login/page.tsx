import Link from "next/link";
import { AuthForm } from "@/app/components/auth-form";

export const metadata = {
  title: "Login | GlobalTrotters",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Main Content */}
      <div className="flex items-start justify-between max-w-7xl mx-auto px-8 py-16">
        {/* Left Side - Form */}
        <div className="w-1/2 max-w-md">
          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8">
            <h2 className="text-4xl font-bold text-white mb-8">Welcome Back</h2>
            <p className="text-gray-300 mb-8">Sign in to your GlobalTrotters account</p>
            <AuthForm mode="login" />
            
            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Globe Logo */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="flex items-center justify-center">
            <img 
              src="/GlobeTrotter.png" 
              alt="GlobeTrotter 3D Globe with Airplane and Location Pins" 
              className="w-96 h-96 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}