import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import {
  Activity,
  LayoutDashboard,
  BarChart,
  LogOut,
  User as UserIcon,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getAuthUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const menuItems = [
    {
      name: "Users & Audits",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics & Telemetry",
      href: "/admin/analytics",
      icon: BarChart,
    },
  ];

  return (
    <div className="flex min-h-screen bg-brand-bg text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-brand-card/30 backdrop-blur-md">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-brand-border">
          <Activity className="h-6 w-6 text-amber-500 live-indicator" />
          <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-primary bg-clip-text text-transparent glow-text-primary">
            RxFlow
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-brand-border/60">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="h-10 w-10 rounded-full bg-amber-500/25 flex items-center justify-center text-amber-500">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user.name}</p>
              <p className="text-[10px] text-amber-400 font-bold uppercase truncate">
                System Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition group"
            >
              <item.icon className="h-5 w-5 text-slate-500 group-hover:text-amber-500 transition" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout action */}
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-card/25 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500 live-indicator" />
            <span className="text-base font-bold bg-gradient-to-r from-amber-500 to-primary bg-clip-text text-transparent">
              RxFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 capitalize">
              Admin
            </span>
            <form action={logoutAction}>
              <button type="submit" className="text-slate-400 hover:text-danger">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        {/* Children Render */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
