"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Mail, Lock, User } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement authentication logic with NextAuth
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="relative hidden w-1/2 lg:block">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070')`,
          }}
        >
          <div className="absolute inset-0 bg-[#0B3D4C]/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/20">
              <Anchor className="h-6 w-6 text-teal-400" />
            </div>
            <span className="text-xl font-bold uppercase tracking-wider text-white">
              freshdart
            </span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Empowering the{" "}
              <span className="text-teal-400">Blue Economy.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Connecting sustainable producers with the global marketplace to
              build a resilient and transparent seafood supply chain.
            </p>
          </div>

          {/* Testimonial */}
          <div className="max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <p className="italic text-gray-200">
              &quot;SeaMarket has transformed how we distribute our fresh catch
              to local MSMEs, ensuring quality and fair pricing for
              everyone.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/20">
                <User className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Local Producer</p>
                <p className="text-sm text-gray-400">
                  Verified Partner since 2023
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <Anchor className="h-6 w-6 text-[#0B3D4C]" />
              <span className="text-xl font-bold text-[#0B3D4C]">SeaMarket</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold italic text-[#0B3D4C]">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-600">
                Please enter your details to access your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C]"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    Or sign in with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#0B3D4C] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-8 py-6">
          <div className="mx-auto max-w-md">
            <p className="text-center text-sm text-gray-500">
              &copy; 2026 freshdart Marketplace. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Terms
              </Link>
              <Link
                href="/help"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
