import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFamilyMemberAction } from "@/app/actions/family";
import { Users, UserPlus, Phone, Calendar, Heart, ShieldAlert } from "lucide-react";
import FamilyFormClient from "@/components/patient/FamilyFormClient";

export default async function FamilyManagementPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "PATIENT" || !user.patient) {
    redirect("/login");
  }

  // Fetch family members
  const familyMembers = await db.familyMember.findMany({
    where: {
      patientId: user.patient.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Family Profiles
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Manage medications, track schedules, and configure notifications for your household from one single patient hub.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Family Member List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Registered Members
            </h2>

            {familyMembers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-brand-border rounded-2xl">
                <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No family members registered</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add members like your spouse, children, or elderly parents to manage their medication schedules and alerts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{member.name}</h3>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-secondary/10 border border-secondary/15 text-secondary rounded-full uppercase tracking-wider">
                          {member.relation}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-brand-border/40 font-light">
                      {member.dob && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" /> DOB: {member.dob}
                        </p>
                      )}
                      {member.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-500" /> Phone: {member.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Family Form Card */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Add Profile
          </h2>
          <FamilyFormClient />
        </div>
      </div>
    </div>
  );
}
