"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDoctorPrescriptionAction } from "@/app/actions/doctor";
import { FilePlus, Plus, Trash2, Loader2, Sparkles, User } from "lucide-react";

interface DoctorPrescriptionClientProps {
  patients: any[];
}

interface PrescribedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  totalQuantity: number;
  timesOfDay: string[];
}

export default function DoctorPrescriptionClient({ patients }: DoctorPrescriptionClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [instructions, setInstructions] = useState("Take as directed by doctor.");
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([
    {
      name: "",
      dosage: "1 tablet",
      frequency: "Once daily",
      duration: "30 days",
      totalQuantity: 30,
      timesOfDay: ["MORNING"],
    },
  ]);

  const handleAddRow = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
        totalQuantity: 30,
        timesOfDay: ["MORNING"],
      },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (idx: number, field: keyof PrescribedMedicine, value: any) => {
    const updated = [...medicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setMedicines(updated);
  };

  const handleToggleTime = (idx: number, time: string) => {
    const med = medicines[idx];
    const times = med.timesOfDay.includes(time)
      ? med.timesOfDay.filter((t) => t !== time)
      : [...med.timesOfDay, time];
    handleUpdateMedicine(idx, "timesOfDay", times);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Please select a patient.");
      return;
    }

    if (medicines.some((m) => !m.name.trim())) {
      alert("Please enter a medicine name for all rows.");
      return;
    }

    startTransition(async () => {
      const res = await addDoctorPrescriptionAction({
        patientId: selectedPatientId,
        instructions,
        medicines,
      });

      if (res?.error) {
        alert(res.error);
      } else {
        alert("Prescription added and patient schedules synchronized!");
        router.push("/doctor/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <FilePlus className="h-8 w-8 text-secondary" /> Write Prescription
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Issue a certified medication schedule order for a registered clinic patient.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection & General Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-brand-border">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Select Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-secondary focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user.name} ({p.user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Prescription Remarks
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-secondary focus:outline-none"
                placeholder="Take after meals, check BP regularly, etc."
              />
            </div>
          </div>

          {/* Medicines Grid rows */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300">Medications</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 text-xs text-secondary font-semibold hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Drug Row
              </button>
            </div>

            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-bg/50 border border-brand-border relative space-y-4"
              >
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-danger transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Drug Name
                    </label>
                    <input
                      type="text"
                      required
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(idx, "name", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2.5 focus:border-secondary focus:outline-none"
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Dosage Detail
                    </label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedicine(idx, "dosage", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2.5 focus:border-secondary focus:outline-none"
                      placeholder="e.g., 500mg, 1 capsule"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Total Quantity (Pack)
                    </label>
                    <input
                      type="number"
                      value={med.totalQuantity}
                      onChange={(e) => handleUpdateMedicine(idx, "totalQuantity", parseInt(e.target.value) || 0)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2.5 focus:border-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Frequency Descriptor
                    </label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicine(idx, "frequency", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2.5 focus:border-secondary focus:outline-none"
                      placeholder="e.g., Three times daily"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicine(idx, "duration", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg text-xs text-white p-2.5 focus:border-secondary focus:outline-none"
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
                    Schedule times mapping
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["MORNING", "AFTERNOON", "EVENING", "NIGHT"].map((time) => {
                      const active = med.timesOfDay.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleToggleTime(idx, time)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                            active
                              ? "bg-secondary/15 border-secondary text-secondary"
                              : "bg-transparent border-brand-border text-slate-400 hover:text-white"
                          }`}
                        >
                          {time.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-brand-border">
            <button
              type="button"
              onClick={() => router.push("/doctor/dashboard")}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:bg-white/5 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-md shadow-secondary/15"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Write Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
