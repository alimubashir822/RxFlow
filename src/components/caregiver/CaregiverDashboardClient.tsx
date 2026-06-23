"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { assignPatientAction, sendCaregiverNoteAction } from "@/app/actions/caregiver";
import {
  Users,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  User,
  Send,
  Loader2,
  Check,
  Search,
  MessageSquare,
} from "lucide-react";

interface CaregiverDashboardClientProps {
  patients: any[];
}

export default function CaregiverDashboardClient({ patients }: CaregiverDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailInput, setEmailInput] = useState("");
  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || "");
  const [careNote, setCareNote] = useState("");

  const activePatient = patients.find((p) => p.id === activePatientId);

  // Link Patient handler
  const handleLinkPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    startTransition(async () => {
      const res = await assignPatientAction(emailInput);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Patient linked successfully!");
        setEmailInput("");
        router.refresh();
      }
    });
  };

  // Send caregiver note handler
  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careNote.trim() || !activePatientId || isPending) return;

    startTransition(async () => {
      const res = await sendCaregiverNoteAction(activePatientId, careNote);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Caregiver alert sent to patient dashboard!");
        setCareNote("");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Users className="h-8 w-8 text-primary animate-pulse" /> Caregiver Monitor Console
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Monitor your family members' daily medications, observe adherence streaks, and configure care instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Linked patients list & link patient form */}
        <div className="space-y-6">
          {/* Link patient form */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Link Family Account</h3>
            <form onSubmit={handleLinkPatient} className="flex gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="patient@example.com"
                className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary focus:outline-none flex-1"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:opacity-90 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Link
              </button>
            </form>
          </div>

          {/* List of Patients */}
          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitored Profiles</h3>
            <div className="space-y-2.5">
              {patients.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">Link a patient email above to get started.</p>
              ) : (
                patients.map((patient) => {
                  const active = patient.id === activePatientId;
                  const totalLogs = patient.doseLogs.length;
                  const takenLogs = patient.doseLogs.filter((l: any) => l.status === "TAKEN").length;
                  const score = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

                  return (
                    <button
                      key={patient.id}
                      onClick={() => setActivePatientId(patient.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition text-left ${
                        active
                          ? "bg-primary/10 border-primary text-white"
                          : "bg-brand-bg/40 border-brand-border hover:bg-white/5 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          active ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-400"
                        }`}>
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{patient.user.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{patient.user.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        score < 80 ? "bg-danger/10 text-danger border-danger/15" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                      }`}>
                        {score}% Adherence
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Monitored Patient compliance dashboard widgets */}
        <div className="lg:col-span-2 space-y-6">
          {activePatient ? (
            <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{activePatient.user.name}</h2>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Role Profile: Patient</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 text-xs text-primary font-bold">
                  <Activity className="h-4.5 w-4.5 text-primary" /> Care Tracker Active
                </div>
              </div>

              {/* Medication Compliance Schedule checklist */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300">Daily Medication Compliance Checklist</h3>

                {activePatient.medicationSchedules.length === 0 ? (
                  <p className="text-xs text-slate-500 font-light py-2">No medications scheduled for this profile.</p>
                ) : (
                  <div className="space-y-3">
                    {activePatient.medicationSchedules.map((schedule: any) => {
                      // Check if taken today (mocked based on today's logs)
                      const isTaken = activePatient.doseLogs.some(
                        (l: any) => l.scheduleId === schedule.id && l.status === "TAKEN"
                      );

                      return (
                        <div
                          key={schedule.id}
                          className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              isTaken ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                            }`}>
                              {isTaken ? <Check className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">
                                {schedule.medicine.name}{" "}
                                <span className="text-xs text-slate-400 font-light">({schedule.medicine.dosage})</span>
                              </h4>
                              <p className="text-[10px] text-slate-400 font-light mt-0.5">
                                Scheduled Time: {schedule.specificTime || schedule.timeOfDay} &bull; Instructions: {schedule.instructions || "No custom directive"}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTaken
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}>
                            {isTaken ? "Completed ✓" : "Pending Log"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Caregiver direct alert messaging console */}
              <div className="pt-6 border-t border-brand-border/40 space-y-3.5">
                <h3 className="text-sm font-bold text-slate-300">Dispatch Care Instruction</h3>
                <form onSubmit={handleSendNote} className="flex gap-2">
                  <input
                    type="text"
                    value={careNote}
                    onChange={(e) => setCareNote(e.target.value)}
                    disabled={isPending}
                    placeholder="Write clinical warning (e.g. 'Take Metformin right now before breakfast.')"
                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                  <button
                    type="submit"
                    disabled={!careNote.trim() || isPending}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-16 text-center rounded-3xl flex flex-col items-center justify-center text-slate-500">
              <Users className="h-12 w-12 text-slate-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-400">No Linked Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a linked patient from the left column or link a new household profile by email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
