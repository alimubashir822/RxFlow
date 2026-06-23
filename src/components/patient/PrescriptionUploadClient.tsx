"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPrescriptionAction } from "@/app/actions/prescriptions";
import {
  FileUp,
  Brain,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";

interface ExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  totalQuantity: number;
  timesOfDay: string[];
}

export default function PrescriptionUploadClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [extractedPlan, setExtractedPlan] = useState<ExtractedMedicine[] | null>(null);
  const [instructions, setInstructions] = useState("Take with water as directed by your physician.");

  const scanSteps = [
    "Uploading secure prescription file...",
    "Executing optical character recognition (OCR)...",
    "Running RxFlow Healthcare LLM analysis...",
    "Extracting drug interactions, dosages, and schedules...",
    "Prescription structured successfully!",
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setScanning(true);
    setScanStep(0);

    // Simulate AI parsing sequence
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= scanSteps.length - 1) {
          clearInterval(interval);
          setScanning(false);
          // Set mock parsed result
          setExtractedPlan([
            {
              name: "Amoxicillin",
              dosage: "500mg",
              frequency: "3 times daily",
              duration: "7 days",
              totalQuantity: 21,
              timesOfDay: ["MORNING", "AFTERNOON", "NIGHT"],
            },
            {
              name: "Atorvastatin",
              dosage: "20mg",
              frequency: "Once daily",
              duration: "30 days",
              totalQuantity: 30,
              timesOfDay: ["NIGHT"],
            },
          ]);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const handleUpdateMedicine = (index: number, field: keyof ExtractedMedicine, value: any) => {
    if (!extractedPlan) return;
    const updated = [...extractedPlan];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedPlan(updated);
  };

  const handleToggleTime = (medIndex: number, time: string) => {
    if (!extractedPlan) return;
    const med = extractedPlan[medIndex];
    const times = med.timesOfDay.includes(time)
      ? med.timesOfDay.filter((t) => t !== time)
      : [...med.timesOfDay, time];
    handleUpdateMedicine(medIndex, "timesOfDay", times);
  };

  const handleAddMedicine = () => {
    const newMed: ExtractedMedicine = {
      name: "New Medicine",
      dosage: "1 tablet",
      frequency: "Once daily",
      duration: "30 days",
      totalQuantity: 30,
      timesOfDay: ["MORNING"],
    };
    setExtractedPlan(extractedPlan ? [...extractedPlan, newMed] : [newMed]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (!extractedPlan) return;
    const updated = extractedPlan.filter((_, i) => i !== index);
    setExtractedPlan(updated.length > 0 ? updated : null);
  };

  const handleConfirmPlan = () => {
    if (!extractedPlan) return;

    startTransition(async () => {
      const res = await addPrescriptionAction({
        instructions,
        medicines: extractedPlan,
      });

      if (res?.error) {
        alert(res.error);
      } else {
        alert("Prescription plan saved and schedules created!");
        router.push("/patient/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> AI Prescription Reader
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Upload your doctor's handwritten or digital prescription document. Our AI constructs a daily dosing plan for you.
        </p>
      </div>

      {!extractedPlan && !scanning && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="glass-panel border-dashed border-2 border-brand-border rounded-3xl p-6 sm:p-12 md:p-16 text-center hover:border-primary/40 hover:bg-white/5 transition flex flex-col items-center justify-center cursor-pointer"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <FileUp className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Drag and drop your prescription</h3>
          <p className="text-sm text-slate-400 font-light max-w-sm mb-4">
            Supports image scans (JPG, PNG) and PDF documents. Max file size 10MB.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-slate-800 border border-brand-border text-slate-200 text-sm font-semibold hover:bg-slate-700 transition">
            Select Document
          </button>
        </div>
      )}

      {/* AI Extraction scanning status */}
      {scanning && (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-6 flex flex-col items-center justify-center">
          <div className="relative h-20 w-20 flex items-center justify-center">
            {/* Pulsing indicator */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative h-14 w-14 rounded-full bg-brand-bg border border-primary flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">RxFlow Vision AI analyzing prescription...</h3>
            <p className="text-xs text-primary font-medium tracking-wide animate-pulse">
              {scanSteps[scanStep]}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full max-w-md bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Results Review Table */}
      {extractedPlan && !scanning && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-primary/20 bg-primary/5 flex items-start gap-4">
            <Info className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Plan Generated <Sparkles className="h-4 w-4 text-primary" />
              </h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Review and fine-tune the extracted medications before saving. Unchecked times will not generate notification reminders.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="text-lg font-bold text-white">Extracted Plan</h3>
              <button
                onClick={handleAddMedicine}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Medication
              </button>
            </div>

            <div className="space-y-6">
              {extractedPlan.map((med, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-4 relative"
                >
                  <button
                    onClick={() => handleRemoveMedicine(index)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-danger transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(index, "name", e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(index, "dosage", e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Pills Count (Pack Size)
                      </label>
                      <input
                        type="number"
                        value={med.totalQuantity}
                        onChange={(e) => handleUpdateMedicine(index, "totalQuantity", parseInt(e.target.value) || 0)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Frequency Label
                      </label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(index, "frequency", e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(index, "duration", e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Times of Day schedule mapping */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Schedule Times
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["MORNING", "AFTERNOON", "EVENING", "NIGHT"].map((time) => {
                        const active = med.timesOfDay.includes(time);
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleToggleTime(index, time)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              active
                                ? "bg-primary/10 border-primary text-primary"
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

            {/* Doctors Instructions */}
            <div className="space-y-2 pt-4 border-t border-brand-border">
              <label className="text-sm font-semibold text-slate-300">General Doctor Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full bg-brand-bg border border-brand-border rounded-xl text-sm text-white p-3.5 focus:border-primary focus:outline-none"
                placeholder="Enter any other guidance listed on prescription..."
              />
            </div>

            {/* Save Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={() => {
                  setExtractedPlan(null);
                  setFile(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:bg-white/5 text-sm font-semibold transition text-center"
              >
                Discard scan
              </button>
              <button
                disabled={isPending}
                onClick={handleConfirmPlan}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-primary/15 transition flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
