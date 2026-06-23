"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Activity, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const response = await loginAction(null, formData);

      if (response?.error) {
        setError(response.error);
        return;
      }

      if (response?.success && response?.role) {
        // Redirect based on role
        const role = response.role;
        let dest = "/";
        if (role === "PATIENT") dest = "/patient/dashboard";
        else if (role === "DOCTOR") dest = "/doctor/dashboard";
        else if (role === "PHARMACIST") dest = "/pharmacy/dashboard";
        else if (role === "ADMIN") dest = "/admin/dashboard";

        router.push(dest);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Activity className="h-8 w-8 text-primary live-indicator" />
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RxFlow
            </span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
            Sign in to your portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover transition"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-55 transition shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
