"use client";

import React, { useState, useTransition } from "react";
import { BellRing, Mail, Smartphone, HelpCircle, Save, ShieldCheck, Volume2 } from "lucide-react";

export default function ReminderSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [snoozeTime, setSnoozeTime] = useState("10");

  const handleSave = () => {
    startTransition(async () => {
      // Simulate network lag
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Reminder preferences saved successfully!");
    });
  };

  const triggerTestAlert = () => {
    alert("Test Medication Alert:\n\n[RxFlow] 8:00 AM - Time for your Metformin (500mg) tablet.\n\n[Taken]  [Snooze]  [Skip]");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BellRing className="h-8 w-8 text-primary" /> Reminder Settings
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Configure how and when you receive medication dosing alerts. Keep preferences up-to-date to maintain high compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-4 flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" /> Notification Channels
            </h2>

            <div className="space-y-4">
              {/* Push Alerts */}
              <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Browser Push Notifications</h3>
                    <p className="text-xs text-slate-500 font-light">Instant alert banner on your desktop or mobile screen.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-primary focus:ring-primary focus:ring-offset-brand-bg bg-brand-bg"
                />
              </div>

              {/* Email Alerts */}
              <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Email Reminders</h3>
                    <p className="text-xs text-slate-500 font-light">Dose alert emails sent to your registered address.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-primary focus:ring-primary focus:ring-offset-brand-bg bg-brand-bg"
                />
              </div>

              {/* SMS Alerts */}
              <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">SMS Text Alerts</h3>
                    <p className="text-xs text-slate-500 font-light">Receive a text notification for high-priority medications.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-primary focus:ring-primary focus:ring-offset-brand-bg bg-brand-bg"
                />
              </div>

              {/* Voice Alerts */}
              <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Voice Alerts</h3>
                    <p className="text-xs text-slate-500 font-light">Receive an automated phone call for critical doses.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-primary focus:ring-primary focus:ring-offset-brand-bg bg-brand-bg"
                />
              </div>
            </div>

            {/* Snooze Settings */}
            <div className="pt-6 border-t border-brand-border space-y-4">
              <h3 className="text-sm font-bold text-white">Snooze & Missed Dose Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Default Snooze Duration
                  </label>
                  <select
                    value={snoozeTime}
                    onChange={(e) => setSnoozeTime(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Missed Dose Grace Period
                  </label>
                  <select
                    className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white p-2.5 focus:border-primary focus:outline-none"
                    defaultValue="60"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-md shadow-primary/10"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Test alerts sidebar widget */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" /> Test Alert System
          </h2>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Simulator</h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Verify if the alert configurations match your browser setup by dispatching a test dosing alert card immediately.
            </p>
            <button
              onClick={triggerTestAlert}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-brand-border text-slate-200 text-xs font-semibold transition"
            >
              Trigger Test Notification
            </button>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-primary pt-4 mt-2">
              <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-primary" />
              <p className="font-light leading-relaxed">
                Critical dose logs are securely logged onto the blockchain audit path for insurance checks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
