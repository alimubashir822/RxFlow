import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DoctorPrescriptionClient from "@/components/doctor/DoctorPrescriptionClient";

export default async function DoctorPrescriptionPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "DOCTOR" || !user.doctor) {
    redirect("/login");
  }

  // Fetch all patients with their user objects
  const patients = await db.patient.findMany({
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return <DoctorPrescriptionClient patients={patients} />;
}
