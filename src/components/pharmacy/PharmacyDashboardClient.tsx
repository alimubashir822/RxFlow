"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRefillStatusAction } from "@/app/actions/pharmacy";
import {
  Inbox,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Activity,
  FileText,
  Filter,
} from "lucide-react";

interface PharmacyDashboardClientProps {
  refillRequests: any[];
}

export default function PharmacyDashboardClient({ refillRequests }: PharmacyDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "PENDING" | "PROCESSING" | "READY" | "DELIVERED">("all");

  const handleUpdateStatus = async (requestId: string, status: any) => {
    startTransition(async () => {
      const res = await updateRefillStatusAction(requestId, status);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  // Stats calculation
  const total = refillRequests.length;
  const pending = refillRequests.filter((r) => r.status === "PENDING").length;
  const processing = refillRequests.filter((r) => r.status === "PROCESSING").length;
  const ready = refillRequests.filter((r) => r.status === "READY").length;
  const completed = refillRequests.filter((r) => r.status === "DELIVERED").length;

  const filteredRequests = refillRequests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-warning/10 text-warning border-warning/20";
      case "PROCESSING":
        return "bg-primary/10 text-primary border-primary/20";
      case "READY":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "DELIVERED":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-danger/10 text-danger border-danger/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Pharmacy Orders Hub</h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Review, dispense, and process refill requests requested by clinic patients.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Received</span>
            <div className="text-2xl font-black text-white mt-1">{total}</div>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-warning font-bold uppercase tracking-wider">New Requests</span>
            <div className="text-2xl font-black text-warning mt-1">{pending}</div>
          </div>
          <div className="h-10 w-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Processing</span>
            <div className="text-2xl font-black text-primary mt-1">{processing}</div>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Ready to Collect</span>
            <div className="text-2xl font-black text-secondary mt-1">{ready}</div>
          </div>
          <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-success font-bold uppercase tracking-wider">Delivered</span>
            <div className="text-2xl font-black text-success mt-1">{completed}</div>
          </div>
          <div className="h-10 w-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main orders table */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Inbox className="h-5 w-5 text-emerald-400" /> Incoming Refill Orders
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-1 p-1 bg-brand-bg rounded-lg border border-brand-border text-xs">
            {(["all", "PENDING", "PROCESSING", "READY", "DELIVERED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition ${
                  filter === status
                    ? "bg-emerald-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {status === "all" ? "All Orders" : status.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No refill orders found matching this status.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-brand-bg/40 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-500" /> {req.patient.user.name}
                    </span>
                    <span className="text-[10px] text-slate-500">&bull;</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-500" /> {req.medicine.name} ({req.medicine.dosage})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-light">
                    Requested on: {new Date(req.requestedAt).toLocaleString()} &bull; Quantity: {req.quantity} pills
                  </p>
                  {req.notes && (
                    <p className="text-[11px] text-amber-400 font-light italic">Notes: "{req.notes}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                  {req.status === "PENDING" && (
                    <>
                      <button
                        disabled={isPending}
                        onClick={() => handleUpdateStatus(req.id, "PROCESSING")}
                        className="px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold transition"
                      >
                        Accept & Process
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                        className="px-3.5 py-2 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/15 text-xs font-semibold text-danger transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === "PROCESSING" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(req.id, "READY")}
                      className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Package className="h-3.5 w-3.5" /> Mark Ready
                    </button>
                  )}

                  {req.status === "READY" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(req.id, "DELIVERED")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Truck className="h-3.5 w-3.5" /> Dispense & Deliver
                    </button>
                  )}

                  {["DELIVERED", "REJECTED"].includes(req.status) && (
                    <span className="text-[11px] text-slate-500 italic">Order completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
