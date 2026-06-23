import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import PharmacyNav from "@/components/pharmacy/PharmacyNav";

interface PharmacyLayoutProps {
  children: React.ReactNode;
}

export default async function PharmacyLayout({ children }: PharmacyLayoutProps) {
  const user = await getAuthUser();

  if (!user || user.role !== "PHARMACIST" || !user.pharmacy) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg text-slate-100">
      <PharmacyNav
        userName={user.name}
        storeName={user.pharmacy.storeName}
        logoutAction={logoutAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Children Render */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
