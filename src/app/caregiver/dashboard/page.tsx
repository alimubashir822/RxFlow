import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import CaregiverDashboardClient from "@/components/caregiver/CaregiverDashboardClient";

export default async function CaregiverDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "CAREGIVER" || !user.caregiver) {
    redirect("/login");
  }

  const caregiverId = user.caregiver.id;

  // Fetch the patient assignments for this caregiver
  const patientAssignments = await db.patientCaregiver.findMany({
    where: {
      caregiverId,
    },
    include: {
      patient: {
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
      },
    },
  });

  // Extract patient records from assignments
  const patients = patientAssignments.map((assignment) => assignment.patient);

  return <CaregiverDashboardClient patients={patients} />;
}
