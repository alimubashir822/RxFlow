import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Users,
  ShieldAlert,
  Activity,
  Calendar,
  Layers,
  Heart,
  Eye,
  Key,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch counts
  const totalUsers = await db.user.count();
  const patientCount = await db.user.count({ where: { role: "PATIENT" } });
  const doctorCount = await db.user.count({ where: { role: "DOCTOR" } });
  const pharmacyCount = await db.user.count({ where: { role: "PHARMACIST" } });

  const totalPrescriptions = await db.prescription.count();
  const totalAuditLogs = await db.auditLog.count();

  // Fetch all users list
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch recent audit logs
  const auditLogs = await db.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Layers className="h-8 w-8 text-amber-500" /> Admin Console
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Monitor system metrics, review account profiles, and inspect compliance audit logs.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total accounts</span>
            <div className="text-3xl font-black text-white mt-1">{totalUsers}</div>
            <p className="text-xs text-slate-500 font-light mt-1">
              {patientCount} patients &bull; {doctorCount} MDs &bull; {pharmacyCount} RX
            </p>
          </div>
          <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prescriptions</span>
            <div className="text-3xl font-black text-white mt-1">{totalPrescriptions}</div>
            <p className="text-xs text-slate-500 font-light mt-1">Digitized AI plans</p>
          </div>
          <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <FileTextIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Audits</span>
            <div className="text-3xl font-black text-white mt-1">{totalAuditLogs}</div>
            <p className="text-xs text-slate-500 font-light mt-1">Security logging active</p>
          </div>
          <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <Key className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Platform Status</span>
            <div className="text-lg font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success live-indicator" /> Operational
            </div>
            <p className="text-xs text-slate-500 font-light mt-1">All systems online</p>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Users List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
              <Users className="h-5 w-5 text-amber-500" /> Account Profiles
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-slate-400">
                    <th className="py-3 font-semibold">User details</th>
                    <th className="py-3 font-semibold">Role</th>
                    <th className="py-3 font-semibold">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-brand-border/40 hover:bg-white/5 transition">
                      <td className="py-3.5 pr-3">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-light mt-0.5">{u.email}</p>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : u.role === "DOCTOR"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : u.role === "PHARMACIST"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-light">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Security Audit logs */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Security Audit
          </h2>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Recent Events</h3>

            {auditLogs.length === 0 ? (
              <p className="text-center text-xs text-slate-600 py-6">No audits logged.</p>
            ) : (
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-brand-bg/50 border border-brand-border space-y-1.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-300">{log.user.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-400 font-light leading-relaxed">{log.details}</p>
                    <p className="text-[9px] text-slate-500 font-light">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}
