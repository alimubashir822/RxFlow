import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DoctorDashboardClient from "@/components/doctor/DoctorDashboardClient";

export default async function DoctorDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "DOCTOR" || !user.doctor) {
    redirect("/login");
  }

  // Fetch patients in the system with their dose logs and schedules
  const patients = await db.patient.findMany({
    include: {
      user: true,
      medicationSchedules: {
        where: {
          status: "ACTIVE",
        },
        include: {
          medicine: true,
        },
      },
      doseLogs: {
        include: {
          schedule: {
            include: {
              medicine: true,
            },
          },
        },
        orderBy: {
          loggedAt: "desc",
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return <DoctorDashboardClient patients={patients} />;
}
