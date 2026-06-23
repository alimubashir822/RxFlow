import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PharmacyDashboardClient from "@/components/pharmacy/PharmacyDashboardClient";

export default async function PharmacyDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "PHARMACIST" || !user.pharmacy) {
    redirect("/login");
  }

  const pharmacyId = user.pharmacy.id;

  // Fetch refill requests for this pharmacy
  const refillRequests = await db.refillRequest.findMany({
    where: {
      pharmacyId,
    },
    include: {
      patient: {
        include: {
          user: true,
        },
      },
      medicine: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  return <PharmacyDashboardClient refillRequests={refillRequests} />;
}
