"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendDoctorInstructionsAction(patientId: string, instructions: string) {
  const user = await getAuthUser();
  if (!user || user.role !== "DOCTOR" || !user.doctor) {
    return { error: "Unauthorized" };
  }

  if (!instructions.trim()) {
    return { error: "Instructions cannot be empty" };
  }

  try {
    // Check if patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return { error: "Patient not found" };
    }

    // Find the latest prescription or create one
    let prescription = await db.prescription.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    if (prescription) {
      await db.prescription.update({
        where: { id: prescription.id },
        data: { instructions },
      });
    } else {
      prescription = await db.prescription.create({
        data: {
          patientId,
          doctorId: user.doctor.id,
          instructions,
        },
      });
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "SEND_DOCTOR_INSTRUCTIONS",
        details: `Sent clinical instructions to patient ${patientId}: "${instructions.substring(0, 50)}..."`,
      },
    });

    revalidatePath("/doctor/dashboard");
    revalidatePath("/patient/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Doctor instructions error:", error);
    return { error: "Failed to send clinical instructions" };
  }
}

export async function addDoctorPrescriptionAction(data: {
  patientId: string;
  instructions?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    totalQuantity: number;
    timesOfDay: string[];
  }[];
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "DOCTOR" || !user.doctor) {
    return { error: "Unauthorized" };
  }

  const { patientId, instructions, medicines } = data;
  const doctorId = user.doctor.id;

  try {
    await db.$transaction(async (tx) => {
      // Create prescription
      const prescription = await tx.prescription.create({
        data: {
          patientId,
          doctorId,
          instructions: instructions || "Written by physician.",
          isExtracted: true,
          aiPlanCreated: true,
        },
      });

      // Loop and insert medicines
      for (const item of medicines) {
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

        // Create schedules
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

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "DOCTOR_CREATE_PRESCRIPTION",
          details: `Doctor created prescription for patient ${patientId} containing ${medicines.length} drugs.`,
        },
      });
    });

    revalidatePath("/doctor/dashboard");
    revalidatePath("/patient/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Doctor prescription create error:", error);
    return { error: "Failed to create prescription" };
  }
}
