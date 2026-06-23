"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateRefillStatusAction(
  requestId: string,
  status: "PENDING" | "PROCESSING" | "READY" | "DELIVERED" | "REJECTED"
) {
  const user = await getAuthUser();
  if (!user || user.role !== "PHARMACIST" || !user.pharmacy) {
    return { error: "Unauthorized" };
  }

  try {
    const request = await db.refillRequest.findUnique({
      where: { id: requestId },
      include: {
        medicine: true,
      },
    });

    if (!request || request.pharmacyId !== user.pharmacy.id) {
      return { error: "Refill request not found or not assigned to your pharmacy" };
    }

    // Update status in a transaction
    await db.$transaction(async (tx) => {
      await tx.refillRequest.update({
        where: { id: requestId },
        data: { status },
      });

      // If status is DELIVERED, refill the medicine's remaining stock!
      if (status === "DELIVERED") {
        const newRemaining = request.medicine.remainingQuantity + request.quantity;
        await tx.medicine.update({
          where: { id: request.medicineId },
          data: {
            remainingQuantity: newRemaining,
            refillCount: request.medicine.refillCount + 1,
          },
        });
      }

      // Add audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_REFILL_STATUS",
          details: `Refill request status for ${request.medicine.name} updated to ${status}.`,
        },
      });
    });

    revalidatePath("/pharmacy/dashboard");
    revalidatePath("/patient/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update refill status error:", error);
    return { error: "Failed to update refill request status" };
  }
}
