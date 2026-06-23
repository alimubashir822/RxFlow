import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "@/components/patient/DashboardClient";

export default async function PatientDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "PATIENT" || !user.patient) {
    redirect("/login");
  }

  const patientId = user.patient.id;

  // Calculate local today start/end
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Fetch active medication schedules
  const schedules = await db.medicationSchedule.findMany({
    where: {
      patientId,
      status: "ACTIVE",
    },
    include: {
      medicine: true,
    },
    orderBy: {
      specificTime: "asc",
    },
  });

  // 2. Fetch dose logs recorded today
  const todayLogs = await db.doseLog.findMany({
    where: {
      patientId,
      loggedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // 3. Fetch active prescriptions count
  const activePrescriptionsCount = await db.prescription.count({
    where: {
      patientId,
    },
  });

  // 4. Fetch low stock medicines (stock <= 5 and medicine isRefillable is true or generally remaining is low)
  const lowStockMedicines = await db.medicine.findMany({
    where: {
      prescription: {
        patientId,
      },
      remainingQuantity: {
        lte: 5,
      },
    },
  });

  // 5. Fetch recent refill requests to check status
  const refillRequests = await db.refillRequest.findMany({
    where: {
      patientId,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  // 6. Fetch all pharmacy users to allow connections/requests
  const pharmacies = await db.pharmacy.findMany({
    orderBy: {
      storeName: "asc",
    },
  });

  return (
    <DashboardClient
      patientName={user.name}
      activePrescriptionsCount={activePrescriptionsCount}
      schedules={schedules}
      todayLogs={todayLogs}
      lowStockMedicines={lowStockMedicines}
      refillRequests={refillRequests}
      pharmacies={pharmacies}
    />
  );
}
