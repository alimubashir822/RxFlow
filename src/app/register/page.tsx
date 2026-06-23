"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { Activity, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"PATIENT" | "DOCTOR" | "PHARMACIST" | "CAREGIVER">("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      const response = await registerAction(null, formData);

      if (response?.error) {
        setError(response.error);
        return;
      }

      if (response?.success && response?.role) {
        const destRole = response.role;
        let dest = "/";
        if (destRole === "PATIENT") dest = "/patient/dashboard";
        else if (destRole === "DOCTOR") dest = "/doctor/dashboard";
        else if (destRole === "PHARMACIST") dest = "/pharmacy/dashboard";
        else if (destRole === "CAREGIVER") dest = "/caregiver/dashboard";

        router.push(dest);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Activity className="h-8 w-8 text-primary live-indicator" />
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RxFlow
            </span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover transition"
            >
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                placeholder="Sarah Connor"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                placeholder="sarah@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password (min 6 chars)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                placeholder="••••••••"
              />
            </div>

            {/* Role Switcher tabs (4 columns) */}
            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">I am registering as a:</span>
              <div className="grid grid-cols-4 gap-2 p-1 bg-brand-bg rounded-lg border border-brand-border">
                {(["PATIENT", "DOCTOR", "PHARMACIST", "CAREGIVER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-[10px] sm:text-xs font-semibold rounded-md transition ${
                      role === r
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r === "PATIENT"
                      ? "Patient"
                      : r === "DOCTOR"
                      ? "Doctor"
                      : r === "PHARMACIST"
                      ? "Pharmacy"
                      : "Caregiver"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditionally Render Role Fields */}
            {role === "DOCTOR" && (
              <div className="space-y-4 pt-2 border-t border-brand-border/40">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-slate-300">
                    Medical Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                    placeholder="Cardiology, Pediatrics, etc."
                  />
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-300">
                    Medical License Number
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                    placeholder="MD-12345678"
                  />
                </div>
              </div>
            )}

            {role === "PHARMACIST" && (
              <div className="space-y-4 pt-2 border-t border-brand-border/40">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-slate-300">
                    Pharmacy Store Name
                  </label>
                  <input
                    id="storeName"
                    name="storeName"
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                    placeholder="MediCare Pharmacy Main"
                  />
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-300">
                    Pharmacy License Number
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                    placeholder="RX-LIC-98765"
                  />
                </div>
              </div>
            )}

            {role === "CAREGIVER" && (
              <div className="space-y-4 pt-2 border-t border-brand-border/40">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                    Contact Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition"
                    placeholder="+1 (555) 765-4321"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-55 transition shadow-lg shadow-primary/20 pt-3"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1">
                  Create Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
