"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

interface CaregiverNavProps {
  userName: string;
  logoutAction: () => void;
}

export default function CaregiverNav({ userName, logoutAction }: CaregiverNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Patient Monitoring",
      href: "/caregiver/dashboard",
      icon: LayoutDashboard,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-brand-border">
        <Activity className="h-6 w-6 text-primary live-indicator" />
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent glow-text-primary">
          RxFlow
        </span>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-brand-border/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{userName}</p>
            <p className="text-[10px] text-primary font-bold uppercase truncate">
              Caregiver Profile
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition group ${
                active
                  ? "bg-primary/10 border-primary/20 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5"
              }`}
            >
              <item.icon className={`h-5 w-5 transition ${
                active ? "text-primary" : "text-slate-500 group-hover:text-primary"
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-brand-border">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm rounded-xl text-slate-400 hover:text-danger hover:bg-danger/5 border border-transparent hover:border-danger/10 transition"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile/tablet) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-brand-card/30 backdrop-blur-md h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (visible on mobile/tablet) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-card/25 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary live-indicator" />
          <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            RxFlow
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary capitalize">
            Caregiver
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="relative w-64 max-w-xs bg-brand-bg border-r border-brand-border h-full flex flex-col z-10 transition-transform duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
