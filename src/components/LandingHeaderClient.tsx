"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, Menu, X } from "lucide-react";

export default function LandingHeaderClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="glass-panel sticky top-0 z-50 w-full px-4 sm:px-6 py-4 border-b border-brand-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary live-indicator rounded-full" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent glow-text-primary">
            RxFlow
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#dashboards" className="hover:text-primary transition">Dashboards</a>
          <a href="#security" className="hover:text-primary transition">Security</a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 px-3 py-1.5 rounded-lg border border-brand-border hover:bg-white/5 transition"
          >
            Sign In
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-brand-card/95 border-b border-brand-border backdrop-blur-lg p-6 space-y-6 shadow-2xl transition-all duration-300 ease-in-out">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-300">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="hover:text-primary transition py-2 border-b border-brand-border/40"
            >
              Features
            </a>
            <a
              href="#dashboards"
              onClick={() => setIsOpen(false)}
              className="hover:text-primary transition py-2 border-b border-brand-border/40"
            >
              Dashboards
            </a>
            <a
              href="#security"
              onClick={() => setIsOpen(false)}
              className="hover:text-primary transition py-2 border-b border-brand-border/40"
            >
              Security
            </a>
          </nav>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white px-5 py-3 rounded-lg hover:opacity-90 transition shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
