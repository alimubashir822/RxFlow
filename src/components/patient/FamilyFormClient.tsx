"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFamilyMemberAction } from "@/app/actions/family";
import { Loader2, UserPlus } from "lucide-react";

export default function FamilyFormClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addFamilyMemberAction(null, formData);

      if (res?.error) {
        setError(res.error);
      } else {
        alert("Family member profile created!");
        e.currentTarget.reset();
        router.refresh();
      }
    });
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-4">
      <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Add Member</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/25 rounded-lg text-xs text-danger text-center">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="John Connor"
          />
        </div>

        <div>
          <label htmlFor="relation" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Relation
          </label>
          <select
            id="relation"
            name="relation"
            required
            className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:border-primary focus:outline-none"
          >
            <option value="SPOUSE">Spouse</option>
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="CHILD">Child</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="dob" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Date of Birth
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Contact Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
