import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Activity,
  User,
  Heart,
  ChevronRight,
} from "lucide-react";

export default async function MedicationJourneyPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "PATIENT" || !user.patient) {
    redirect("/login");
  }

  const patientId = user.patient.id;

  // Fetch all medicines for this patient
  const medicines = await db.medicine.findMany({
    where: {
      prescription: {
        patientId,
      },
    },
    include: {
      medicationSchedules: true,
      prescription: {
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch recent dose logs
  const doseLogs = await db.doseLog.findMany({
    where: {
      patientId,
    },
    include: {
      schedule: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: {
      loggedAt: "desc",
    },
    take: 20, // limit to 20 recent logs
  });

  // Build a timeline based on actual medicines and logs
  const timelineEvents: {
    date: string;
    title: string;
    description: string;
    type: "start" | "complete" | "refill" | "log";
  }[] = [];

  medicines.forEach((med) => {
    // Add start date event
    const startStr = new Date(med.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    timelineEvents.push({
      date: startStr,
      title: `Started: ${med.name}`,
      description: `Began taking ${med.name} (${med.dosage}) - ${med.frequency} for ${med.duration}. Prescribed by ${med.prescription.doctor?.user?.name || "Dr. Alexander Fleming"}`,
      type: "start",
    });

    // Add predicted refill event if low
    if (med.remainingQuantity <= 5 && med.isRefillable) {
      const refillDate = new Date();
      refillDate.setDate(refillDate.getDate() + 3); // estimated finish
      const refillStr = refillDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      timelineEvents.push({
        date: refillStr,
        title: `Refill Due: ${med.name}`,
        description: `Your stock will run out in 3 days. Order a refill of ${med.name} to avoid dose disruption.`,
        type: "refill",
      });
    }
  });

  // Sort timeline events chronologically
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" /> Medication Journey
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Monitor your medical timeline, track dose compliance, and check remaining pill quantities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Middle: Medication list and Journey Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Medications List */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Active Prescription Drugs
            </h2>

            {medicines.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No active drugs found. Please upload a prescription to seed medications.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className="p-5 rounded-2xl bg-brand-bg/50 border border-brand-border flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white">{med.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          med.remainingQuantity <= 5 ? "bg-danger/10 text-danger border border-danger/15" : "bg-primary/10 text-primary border border-primary/15"
                        }`}>
                          {med.remainingQuantity} / {med.totalQuantity} Left
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                        Dosage: {med.dosage} &bull; Frequency: {med.frequency} &bull; Duration: {med.duration}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Prescriber: {med.prescription.doctor?.user?.name || "Dr. Alexander Fleming, MD"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-brand-border/40 text-slate-400">
                      <span>Schedule: {med.medicationSchedules.length} Daily Doses</span>
                      <span className="text-[10px] uppercase font-bold text-primary">
                        {med.isRefillable ? "Refillable" : "No Refills"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Timeline */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Journey Timeline
            </h2>

            {timelineEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Timeline is empty. Log doses or add prescriptions to populate.
              </div>
            ) : (
              <div className="relative border-l border-brand-border ml-3 pl-6 space-y-8">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-brand-bg flex items-center justify-center ${
                      evt.type === "start"
                        ? "bg-primary"
                        : evt.type === "refill"
                        ? "bg-danger animate-pulse"
                        : "bg-success"
                    }`} />

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                        {evt.date}
                      </span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {evt.title}
                        {evt.type === "refill" && (
                          <span className="text-[9px] font-bold bg-danger/10 text-danger border border-danger/15 rounded-full px-1.5 uppercase">
                            High Priority
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Recent Log History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Adherence Logs
          </h2>

          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Recent Logs</h3>

            {doseLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-xs">
                No logs recorded yet. Use the dashboard to log today's medications.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {doseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-brand-bg/50 border border-brand-border flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{log.schedule.medicine.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Logged on: {new Date(log.loggedAt).toLocaleDateString()} at {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      log.status === "TAKEN"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                        : log.status === "SNOOZED"
                        ? "bg-warning/10 text-warning border-warning/15"
                        : "bg-danger/10 text-danger border-danger/15"
                    }`}>
                      {log.status}
                    </span>
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
