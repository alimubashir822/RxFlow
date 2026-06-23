"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface ExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  totalQuantity: number;
  timesOfDay: string[]; // e.g., ["MORNING", "EVENING"]
}

export async function addPrescriptionAction(data: {
  instructions?: string;
  medicines: ExtractedMedicine[];
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT" || !user.patient) {
    return { error: "Unauthorized" };
  }

  const patientId = user.patient.id;

  try {
    // Write in transaction
    await db.$transaction(async (tx) => {
      // 1. Create prescription
      const prescription = await tx.prescription.create({
        data: {
          patientId,
          instructions: data.instructions || "AI generated medication plan.",
          isExtracted: true,
          aiPlanCreated: true,
        },
      });

      // 2. Loop through medicines and insert
      for (const item of data.medicines) {
        const medicine = await tx.medicine.create({
          data: {
            prescriptionId: prescription.id,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            totalQuantity: item.totalQuantity,
            remainingQuantity: item.totalQuantity,
            isRefillable: true,
          },
        });

        // 3. For each time of day, create a schedule
        for (const time of item.timesOfDay) {
          let specificTime = "08:00";
          if (time === "AFTERNOON") specificTime = "13:00";
          else if (time === "EVENING") specificTime = "18:00";
          else if (time === "NIGHT") specificTime = "21:00";

          await tx.medicationSchedule.create({
            data: {
              patientId,
              medicineId: medicine.id,
              timeOfDay: time,
              specificTime,
              dosage: item.dosage,
              instructions: `Take ${item.name} (${item.dosage}) at ${time.toLowerCase()}`,
              status: "ACTIVE",
            },
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "UPLOAD_PRESCRIPTION",
          details: `Uploaded & parsed prescription. Added ${data.medicines.length} medicines.`,
        },
      });
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/medications");
    return { success: true };
  } catch (err: any) {
    console.error("Add prescription error:", err);
    return { error: "Failed to save prescription. Please try again." };
  }
}
