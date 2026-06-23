"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { sendDoctorInstructionsAction } from "@/app/actions/doctor";
import {
  Users,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";

interface DoctorDashboardClientProps {
  patients: any[];
}

export default function DoctorDashboardClient({ patients }: DoctorDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || "");
  const [instructionsText, setInstructionsText] = useState("");

  const activePatient = patients.find((p) => p.id === activePatientId);

  const handleSendInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionsText.trim() || !activePatientId || isPending) return;

    startTransition(async () => {
      const res = await sendDoctorInstructionsAction(activePatientId, instructionsText);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Clinical instructions sent to patient successfully!");
        setInstructionsText("");
        router.refresh();
      }
    });
  };

  // Calculate adherence scores for rendering
  const getPatientAdherence = (patient: any) => {
    const totalLogs = patient.doseLogs.length;
    if (totalLogs === 0) return 100; // default healthy
    const takenLogs = patient.doseLogs.filter((l: any) => l.status === "TAKEN").length;
    return Math.round((takenLogs / totalLogs) * 100);
  };

  const getPatientMissedCount = (patient: any) => {
    return patient.doseLogs.filter((l: any) => l.status === "SKIPPED").length;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Activity className="h-8 w-8 text-secondary" /> Clinical Adherence Portal
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Monitor your patients' medication adherence schedules, review missed doses, and dispatch prescription directives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Patient list */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-secondary" /> Registered Patients
          </h2>

          <div className="space-y-3.5">
            {patients.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No registered patients found.</p>
            ) : (
              patients.map((patient) => {
                const active = patient.id === activePatientId;
                const adherence = getPatientAdherence(patient);
                const missed = getPatientMissedCount(patient);

                return (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setActivePatientId(patient.id);
                      setInstructionsText("");
                    }}
                    className={`w-full flex flex-col gap-3.5 p-4 rounded-2xl transition text-left border ${
                      active
                        ? "bg-secondary/10 border-secondary/20 text-white"
                        : "bg-brand-bg/40 border-brand-border hover:bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        active ? "bg-secondary/20 text-secondary" : "bg-slate-800 text-slate-400"
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-none">{patient.user.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                          Pat-ID: {patient.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-brand-border/40 pt-2.5">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Adherence</span>
                        <p className={`font-bold ${adherence < 80 ? "text-danger" : "text-emerald-400"}`}>
                          {adherence}%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Missed Doses</span>
                        <p className={`font-bold ${missed > 2 ? "text-danger" : "text-slate-300"}`}>
                          {missed}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Patient Adherence details & Prescription Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activePatient ? (
            <>
              {/* Patient Detail Panel */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activePatient.user.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Email: {activePatient.user.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/10 border border-secondary/15 text-xs font-bold text-secondary">
                    <Heart className="h-3.5 w-3.5 animate-pulse" /> Adherence: {getPatientAdherence(activePatient)}%
                  </span>
                </div>

                {/* Patient Dosing Plan Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-300">Medication Dosing Plan</h3>

                  {activePatient.medicationSchedules.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No active medication schedules configured.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePatient.medicationSchedules.map((sched: any) => (
                        <div key={sched.id} className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border space-y-1">
                          <h4 className="text-xs font-bold text-white flex items-center justify-between">
                            {sched.medicine.name}
                            <span className="text-[9px] text-slate-500 uppercase">{sched.timeOfDay}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 font-light mt-0.5">Dose: {sched.dosage}</p>
                          <p className="text-[10px] text-slate-500">Remaining pills: {sched.medicine.remainingQuantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient Dose Logs Timeline */}
                <div className="space-y-4 pt-4 border-t border-brand-border/40">
                  <h3 className="text-sm font-bold text-slate-300">Compliance Log History (Last 10 days)</h3>
                  {activePatient.doseLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No compliance log records found.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {activePatient.doseLogs.slice(0, 10).map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-300">{log.schedule.medicine.name}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              {new Date(log.loggedAt).toLocaleDateString()} &bull; {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            log.status === "TAKEN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                              : "bg-danger/10 text-danger border-danger/15"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send clinical instruction section */}
                <div className="pt-6 border-t border-brand-border space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-300">Clinical Directives</h3>
                  <form onSubmit={handleSendInstructions} className="flex gap-2">
                    <input
                      type="text"
                      value={instructionsText}
                      onChange={(e) => setInstructionsText(e.target.value)}
                      disabled={isPending}
                      placeholder="Write instructions (e.g., 'Double water intake when taking Lisinopril.')"
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs text-white focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition"
                    />
                    <button
                      type="submit"
                      disabled={!instructionsText.trim() || isPending}
                      className="px-4 py-3 rounded-xl bg-secondary text-white font-bold hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-16 text-center rounded-3xl flex flex-col items-center justify-center text-slate-500">
              <Users className="h-12 w-12 text-slate-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-400">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a patient from the database sidebar console to review their active compliance analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
