"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart as IconChart, Activity, Heart, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminAnalyticsPage() {
  // Mock analytics data representing platform-wide statistics
  const adherenceData = [
    { name: "Mon", rate: 82 },
    { name: "Tue", rate: 85 },
    { name: "Wed", rate: 81 },
    { name: "Thu: Audit", rate: 89 },
    { name: "Fri", rate: 87 },
    { name: "Sat", rate: 91 },
    { name: "Sun", rate: 93 },
  ];

  const userDistribution = [
    { name: "Patients", count: 420, fill: "#0ea5e9" },
    { name: "Doctors", count: 85, fill: "#6366f1" },
    { name: "Pharmacies", count: 45, fill: "#10b981" },
  ];

  const refillVolume = [
    { name: "Week 1", requested: 45, completed: 38 },
    { name: "Week 2", requested: 62, completed: 58 },
    { name: "Week 3", requested: 58, completed: 55 },
    { name: "Week 4", requested: 80, completed: 72 },
  ];

  const doseStatusBreakdown = [
    { name: "Taken Doses", value: 85, color: "#10b981" },
    { name: "Skipped Doses", value: 9, color: "#f43f5e" },
    { name: "Snoozed Doses", value: 6, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <IconChart className="h-8 w-8 text-amber-500" /> Platform Telemetry
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Real-time compliance analytics, refill processing status, and user cohort tracking metrics.
        </p>
      </div>

      {/* Analytics cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adherence Rates */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
            <Heart className="h-4.5 w-4.5 text-primary" /> Medication Adherence Trend (Weekly Avg)
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Adherence Rate (%)"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Refill Volumes */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
            <RefreshCw className="h-4.5 w-4.5 text-emerald-400" /> Refill Requests Processing Vol
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={refillVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="requested"
                  name="Requested"
                  stroke="#6366f1"
                  fill="rgba(99, 102, 241, 0.15)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed (Delivered)"
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts breakdown */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-secondary" /> Account Distributions
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Accounts Active" radius={[4, 4, 0, 0]}>
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance breakdown pie chart */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
            <AlertCircle className="h-4.5 w-4.5 text-amber-400" /> Platform Dose Compliance Breakdown
          </h3>
          <div className="h-64 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Pie
                  data={doseStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {doseStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
