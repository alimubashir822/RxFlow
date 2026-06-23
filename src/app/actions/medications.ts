"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logDoseAction(scheduleId: string, status: "TAKEN" | "SNOOZED" | "SKIPPED", notes?: string) {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT" || !user.patient) {
    return { error: "Unauthorized" };
  }

  try {
    const schedule = await db.medicationSchedule.findUnique({
      where: { id: scheduleId },
      include: { medicine: true },
    });

    if (!schedule || schedule.patientId !== user.patient.id) {
      return { error: "Medication schedule not found" };
    }

    // Create DoseLog
    await db.doseLog.create({
      data: {
        scheduleId,
        patientId: user.patient.id,
        status,
        notes,
      },
    });

    // If dose was taken, decrement the remaining quantity on the medicine
    if (status === "TAKEN") {
      const newRemaining = Math.max(0, schedule.medicine.remainingQuantity - 1);
      await db.medicine.update({
        where: { id: schedule.medicineId },
        data: { remainingQuantity: newRemaining },
      });
    }

    // Add Audit Log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "LOG_DOSE",
        details: `Logged dose for ${schedule.medicine.name} as ${status}. Remaining: ${
          status === "TAKEN" ? schedule.medicine.remainingQuantity - 1 : schedule.medicine.remainingQuantity
        }`,
      },
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/medications");
    return { success: true };
  } catch (error: any) {
    console.error("Log dose error:", error);
    return { error: "Failed to record dose log" };
  }
}

export async function requestRefillAction(medicineId: string, pharmacyId: string, quantity: number = 30) {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT" || !user.patient) {
    return { error: "Unauthorized" };
  }

  try {
    const medicine = await db.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return { error: "Medicine not found" };
    }

    // Create refill request
    const refill = await db.refillRequest.create({
      data: {
        patientId: user.patient.id,
        medicineId,
        pharmacyId,
        quantity,
        status: "PENDING",
      },
    });

    // Add Audit Log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "REQUEST_REFILL",
        details: `Requested refill for ${medicine.name} (Qty: ${quantity})`,
      },
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/medications");
    return { success: true, refillId: refill.id };
  } catch (error: any) {
    console.error("Refill request error:", error);
    return { error: "Failed to request refill" };
  }
}
