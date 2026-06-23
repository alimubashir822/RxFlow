"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { logDoseAction, requestRefillAction } from "@/app/actions/medications";
import { seedDemoDataAction } from "@/app/actions/seed";
import {
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone,
  FileText,
  User as UserIcon,
  HelpCircle,
  Flame,
  Droplet,
  Shield,
  Sparkles,
  Volume2,
  FileDown,
  X,
} from "lucide-react";

interface DashboardClientProps {
  patientName: string;
  activePrescriptionsCount: number;
  schedules: any[];
  todayLogs: any[];
  lowStockMedicines: any[];
  refillRequests: any[];
  pharmacies: any[];
}

export default function DashboardClient({
  patientName,
  activePrescriptionsCount,
  schedules,
  todayLogs,
  lowStockMedicines,
  refillRequests,
  pharmacies,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [seeding, setSeeding] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(pharmacies[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"all" | "morning" | "afternoon" | "evening" | "night">("all");

  // Medication OS Unique Features States
  const [diseaseMode, setDiseaseMode] = useState<"general" | "diabetes" | "heart">("general");
  const [showPassport, setShowPassport] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [streakCount] = useState(7); // Mock 7 day streak

  // Diabetes Tracker
  const [glucoseVal, setGlucoseVal] = useState("");
  const [glucoseLogs, setGlucoseLogs] = useState([
    { val: "112 mg/dL", time: "Today, 8:15 AM", type: "Fasting" },
    { val: "128 mg/dL", time: "Yesterday, 1:30 PM", type: "Post-Meal" },
  ]);

  // Heart Tracker
  const [bpVal, setBpVal] = useState("");
  const [bpLogs, setBpLogs] = useState([
    { val: "120/80 mmHg", time: "Today, 8:05 AM", pulse: "72 bpm" },
    { val: "122/82 mmHg", time: "Yesterday, 8:10 AM", pulse: "75 bpm" },
  ]);

  // Determine greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Seed handler
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await seedDemoDataAction();
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  // Log dose handler
  const handleLogDose = async (scheduleId: string, status: "TAKEN" | "SNOOZED" | "SKIPPED") => {
    startTransition(async () => {
      const res = await logDoseAction(scheduleId, status);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  // Refill request handler
  const handleRequestRefill = async (medicineId: string) => {
    if (!selectedPharmacyId) {
      alert("Please select a connected pharmacy first.");
      return;
    }
    startTransition(async () => {
      const res = await requestRefillAction(medicineId, selectedPharmacyId);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Refill request sent to pharmacy successfully!");
        router.refresh();
      }
    });
  };

  // Log Glucose handler
  const handleLogGlucose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!glucoseVal.trim()) return;
    setGlucoseLogs([
      { val: `${glucoseVal} mg/dL`, time: "Just now", type: "Fasting" },
      ...glucoseLogs,
    ]);
    setGlucoseVal("");
    alert("Blood glucose level logged successfully!");
  };

  // Log Blood Pressure handler
  const handleLogBp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpVal.trim()) return;
    setBpLogs([
      { val: `${bpVal} mmHg`, time: "Just now", pulse: "74 bpm" },
      ...bpLogs,
    ]);
    setBpVal("");
    alert("Blood pressure metrics logged successfully!");
  };

  // Calculate adherence percentage for today
  const totalDosesToday = schedules.length;
  const takenDosesToday = todayLogs.filter((log) => log.status === "TAKEN").length;
  const adherenceToday = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  // Filter schedules by activeTab
  const filteredSchedules = schedules.filter((schedule) => {
    if (activeTab === "all") return true;
    return schedule.timeOfDay.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-8 relative">
      {/* Top Banner / Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-card to-slate-900 border border-brand-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent glow-text-primary">{patientName}</span> 👋
            </h1>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400" /> {streakCount} Day Streak
            </div>
          </div>
          <p className="text-sm text-slate-400 font-light max-w-xl">
            Welcome to RxFlow Medication OS. You have completed {takenDosesToday} of your {totalDosesToday} scheduled doses today.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chronic disease selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Care Focus:</span>
            <select
              value={diseaseMode}
              onChange={(e) => setDiseaseMode(e.target.value as any)}
              className="bg-brand-bg/80 border border-brand-border text-xs rounded-xl text-white px-3 py-2 focus:border-primary focus:outline-none"
            >
              <option value="general">General Health</option>
              <option value="diabetes">Diabetes Care Mode</option>
              <option value="heart">Heart Support Mode</option>
            </select>
          </div>

          {schedules.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-primary/20 transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Quick-Seed Demo Profile
            </button>
          )}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Adherence Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Today's Adherence</span>
            <div className="text-3xl font-black text-white glow-text-primary">{adherenceToday}%</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Consistent Adherence
            </p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0ea5e9"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * adherenceToday) / 100}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <Heart className="absolute h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Active Orders</span>
            <div className="text-3xl font-black text-white">{activePrescriptionsCount}</div>
            <p className="text-xs text-slate-400 font-light">Active Medical Orders</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Refill Alerts Alert */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Low Stock Pills</span>
            <div className="text-3xl font-black text-white">{lowStockMedicines.length}</div>
            <p className="text-xs text-danger flex items-center gap-1 font-medium">
              {lowStockMedicines.length > 0 && <AlertTriangle className="h-3 w-3" />} Refills needed soon
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${lowStockMedicines.length > 0 ? "bg-danger/15 text-danger" : "bg-slate-800 text-slate-400"}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Pharmacy Status */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1 col-span-2">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Connected Pharmacy</span>
            <div className="text-base font-bold text-white truncate max-w-[150px]">
              {pharmacies[0]?.storeName || "None Connected"}
            </div>
            <p className="text-xs text-primary flex items-center gap-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-success live-indicator" /> Connected
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Disease Mode Custom Action Tracker Panel (Medication OS Differentiator) */}
      {diseaseMode !== "general" && (
        <div className="glass-panel rounded-3xl p-6 border border-primary/10 bg-brand-card/25 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              {diseaseMode === "diabetes" ? (
                <Droplet className="h-6 w-6 text-danger animate-pulse" />
              ) : (
                <Activity className="h-6 w-6 text-secondary animate-pulse" />
              )}
              <h3 className="text-lg font-bold text-white">
                {diseaseMode === "diabetes" ? "Glucose Logging" : "Blood Pressure Logging"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Track clinical vitals relative to medication intake. These reports are synchronized with the Doctor's console.
            </p>

            {diseaseMode === "diabetes" ? (
              <form onSubmit={handleLogGlucose} className="flex gap-2 pt-2">
                <input
                  type="number"
                  value={glucoseVal}
                  onChange={(e) => setGlucoseVal(e.target.value)}
                  placeholder="e.g. 110 mg/dL"
                  className="bg-brand-bg/80 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Log
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogBp} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={bpVal}
                  onChange={(e) => setBpVal(e.target.value)}
                  placeholder="e.g. 120/80 mmHg"
                  className="bg-brand-bg/80 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-secondary hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Log
                </button>
              </form>
            )}
          </div>

          <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-brand-border/40 pt-4 md:pt-0 md:pl-6 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historical Telemetry</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[120px] overflow-y-auto pr-1">
              {diseaseMode === "diabetes"
                ? glucoseLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg/60 border border-brand-border rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{log.val}</span>
                        <span className="text-[9px] text-danger/80 bg-danger/5 border border-danger/10 px-1.5 py-0.5 rounded">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{log.time}</p>
                    </div>
                  ))
                : bpLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg/60 border border-brand-border rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{log.val}</span>
                        <span className="text-[9px] text-secondary/80 bg-secondary/5 border border-secondary/10 px-1.5 py-0.5 rounded">
                          {log.pulse}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{log.time}</p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Medication Schedule Widget */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Today's Routine Schedule
            </h2>

            <div className="flex flex-wrap gap-1 p-1 bg-brand-card rounded-lg border border-brand-border text-xs">
              {(["all", "morning", "afternoon", "evening", "night"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md font-semibold capitalize transition ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-brand-border">
              <HelpCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-300">No scheduled medications</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                There are no active medication schedules matching this time. Upload a prescription or click Quick-Seed above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => {
                const log = todayLogs.find((l) => l.scheduleId === schedule.id);

                return (
                  <div
                    key={schedule.id}
                    className={`glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      log?.status === "TAKEN" ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        log?.status === "TAKEN"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : log?.status === "SKIPPED"
                          ? "bg-danger/10 text-danger"
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{schedule.medicine.name}</h3>
                          <span className="text-xs text-slate-400">({schedule.medicine.dosage})</span>
                          {log && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              log.status === "TAKEN"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : log.status === "SNOOZED"
                                ? "bg-warning/15 text-warning border border-warning/20"
                                : "bg-danger/15 text-danger border border-danger/20"
                            }`}>
                              {log.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-light">
                          <Clock className="h-3.5 w-3.5 text-slate-500" /> {schedule.specificTime || schedule.timeOfDay} &bull; {schedule.dosage || schedule.instructions || "No instructions"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pills remaining: <span className={schedule.medicine.remainingQuantity <= 5 ? "text-danger font-semibold" : "text-slate-400"}>{schedule.medicine.remainingQuantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                      {!log ? (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() => handleLogDose(schedule.id, "TAKEN")}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Taken
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleLogDose(schedule.id, "SNOOZED")}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                          >
                            Snooze
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleLogDose(schedule.id, "SKIPPED")}
                            className="px-3 py-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-xs font-semibold text-danger border border-danger/15 transition"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isPending}
                          onClick={() => handleLogDose(schedule.id, "TAKEN")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-400 transition"
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Refill Automation and Pharmacy Connection Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Refill Automation
          </h2>

          <div className="space-y-4">
            {/* Quick Access Card Passport / AI Prep triggers */}
            <div className="glass-panel p-5 rounded-2xl space-y-3.5">
              <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1">
                <Shield className="h-4.5 w-4.5 text-primary animate-pulse" /> Patient Care Passport
              </h3>
              <p className="text-xs text-slate-400 font-light">
                Securely structured clinical data. Share or access emergency information instantly.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPassport(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-brand-border text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5 text-primary" /> Care Passport
                </button>
                <button
                  onClick={() => setShowPrep(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-brand-border text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" /> AI Doctor Prep
                </button>
              </div>
            </div>

            {lowStockMedicines.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl border border-brand-border text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-200">All stocks healthy</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  None of your active refillable medications are running low. We'll alert you when stock goes below 5 pills.
                </p>
              </div>
            ) : (
              lowStockMedicines.map((medicine) => {
                const activeRequest = refillRequests.find(
                  (req) => req.medicineId === medicine.id && ["PENDING", "PROCESSING", "READY"].includes(req.status)
                );

                return (
                  <div
                    key={medicine.id}
                    className="glass-panel border-danger/25 bg-danger/5 p-5 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{medicine.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Dose: {medicine.dosage}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                        {medicine.remainingQuantity} pills left
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Your current stock will finish in approximately 3 days. Send a request to your connected pharmacy now to secure your refill.
                    </p>

                    {activeRequest ? (
                      <div className="pt-2">
                        <span className="inline-flex w-full justify-center items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15 text-xs font-semibold uppercase">
                          Refill Request: {activeRequest.status}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-brand-border/40">
                        {pharmacies.length > 0 ? (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-400">Select Pharmacy</label>
                              <select
                                value={selectedPharmacyId}
                                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2 focus:border-primary focus:outline-none"
                              >
                                {pharmacies.map((pharm) => (
                                  <option key={pharm.id} value={pharm.id}>
                                    {pharm.storeName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              disabled={isPending}
                              onClick={() => handleRequestRefill(medicine.id)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold transition shadow-md shadow-primary/10 flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Order Refill Now
                            </button>
                          </>
                        ) : (
                          <p className="text-xs text-amber-400 font-medium">
                            No pharmacy connected. Register a pharmacy account to unlock one-click refills.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Connected Pharmacy Contact details */}
            {pharmacies.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Connected Pharmacy Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-300">{pharmacies[0].storeName}</p>
                      <p className="text-slate-500 font-light mt-0.5">{pharmacies[0].address || "No address listed"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-slate-400 font-light">{pharmacies[0].phone || "+1 (555) 987-6543"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Passport Modal */}
      {showPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <button
              onClick={() => setShowPassport(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center space-y-1">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">My Emergency Care Passport</h2>
              <p className="text-xs text-slate-400 font-light">Present this profile to first responders or medical clinics.</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-border/40 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Patient Name</span>
                  <p className="font-semibold text-slate-200">{patientName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Blood Type</span>
                  <p className="font-semibold text-danger">O-Positive (O+)</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Allergies & Contraindications</span>
                <p className="font-semibold text-warning">Penicillin, Sulfa Drugs</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Primary Physician</span>
                  <p className="font-semibold text-slate-200">Dr. Alexander Fleming</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Emergency Contact</span>
                  <p className="font-semibold text-slate-200">John Connor (+1 555-765-4321)</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Current Dosing Regimen</span>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {schedules.map((s, idx) => (
                    <div key={idx} className="p-2 bg-brand-bg rounded-lg border border-brand-border flex justify-between">
                      <span className="font-medium text-slate-300">{s.medicine.name}</span>
                      <span className="text-[10px] text-slate-500">{s.medicine.dosage} &bull; {s.timeOfDay}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Passport offline copy downloaded!")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <FileDown className="h-4 w-4" /> Download Offline PDF Copy
            </button>
          </div>
        </div>
      )}

      {/* Doctor Appointment Prep Modal */}
      {showPrep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <button
              onClick={() => setShowPrep(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center space-y-1">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">AI Doctor Visit Preparation</h2>
              <p className="text-xs text-slate-400 font-light">Structured review package generated by RxFlow AI.</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-border/40 text-xs">
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Platform Adherence Insights
                </h4>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  Your general adherence score is <span className="text-white font-bold">{adherenceToday}%</span>. 
                  Metformin morning adherence is excellent (100%), but Lisinopril evening doses show 3 misses this month due to late shifts.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Prepared Doctor Questions</span>
                <div className="p-3.5 bg-brand-bg rounded-xl border border-brand-border space-y-2 font-light text-slate-300 leading-relaxed">
                  <p>1. Should my dose timing change for Lisinopril to accommodate late working shifts?</p>
                  <p>2. Amoxicillin course completed on June 15: Are any secondary checks needed?</p>
                  <p>3. Do my logged blood sugar trends indicate stable metabolic progression?</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Current Active Medications list</span>
                <p className="text-slate-400 mt-1 font-light">
                  {schedules.map((s) => s.medicine.name).filter((value, index, self) => self.indexOf(value) === index).join(", ")}
                </p>
              </div>
            </div>

            <button
              onClick={() => alert("Appointment prep package shared with your primary care provider!")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-slate-950" /> Sync Prep Sheet with Clinic Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
