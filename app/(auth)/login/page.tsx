import Link from "next/link";
import { AuthForm } from "@/app/components/auth-form";

export const metadata = {
  title: "Login | GlobalTrotters",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Main Content */}
      <div className="flex items-start justify-between max-w-7xl mx-auto px-8 py-16">
        {/* Left Side - Form */}
        <div className="w-1/2 max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to your GlobalTrotters account</p>
            <AuthForm mode="login" />
            
            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-green-600 hover:text-green-700 font-medium transition-colors">
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