"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function assignPatientAction(patientEmail: string) {
  const user = await getAuthUser();
  if (!user || user.role !== "CAREGIVER" || !user.caregiver) {
    return { error: "Unauthorized" };
  }

  if (!patientEmail.trim()) {
    return { error: "Patient email is required" };
  }

  try {
    // Find patient by email
    const patientUser = await db.user.findFirst({
      where: {
        email: patientEmail,
        role: "PATIENT",
      },
      include: {
        patient: true,
      },
    });

    if (!patientUser || !patientUser.patient) {
      return { error: "No patient account found with that email address" };
    }

    const patientId = patientUser.patient.id;
    const caregiverId = user.caregiver.id;

    // Check if already assigned
    const existing = await db.patientCaregiver.findUnique({
      where: {
        patientId_caregiverId: {
          patientId,
          caregiverId,
        },
      },
    });

    if (existing) {
      return { error: "This patient is already linked to your profile" };
    }

    // Create relation
    await db.patientCaregiver.create({
      data: {
        patientId,
        caregiverId,
      },
    });

    // Log action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "CAREGIVER_LINK_PATIENT",
        details: `Caregiver linked patient ${patientUser.name} (${patientEmail})`,
      },
    });

    revalidatePath("/caregiver/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Assign patient error:", error);
    return { error: "Failed to link patient profile" };
  }
}

export async function sendCaregiverNoteAction(patientId: string, note: string) {
  const user = await getAuthUser();
  if (!user || user.role !== "CAREGIVER" || !user.caregiver) {
    return { error: "Unauthorized" };
  }

  if (!note.trim()) {
    return { error: "Note content cannot be empty" };
  }

  try {
    // Create an audit log or message representing the care warning
    // For simplicity, we create a system message from caregiver user to patient user
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      return { error: "Patient not found" };
    }

    await db.message.create({
      data: {
        senderId: user.id,
        receiverId: patient.userId,
        content: `[Caregiver Note] ${note}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "CAREGIVER_SEND_NOTE",
        details: `Sent care note to patient ${patient.user.name}: "${note}"`,
      },
    });

    revalidatePath("/caregiver/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Caregiver note error:", error);
    return { error: "Failed to send caregiver note" };
  }
}
