"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addFamilyMemberAction(prevState: any, formData: FormData) {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT" || !user.patient) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const relation = formData.get("relation") as string;
  const dob = formData.get("dob") as string;
  const phone = formData.get("phone") as string;

  if (!name || !relation) {
    return { error: "Name and relation are required fields" };
  }

  try {
    await db.familyMember.create({
      data: {
        patientId: user.patient.id,
        name,
        relation,
        dob,
        phone,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "ADD_FAMILY_MEMBER",
        details: `Added family profile for ${name} (${relation})`,
      },
    });

    revalidatePath("/patient/family");
    return { success: true };
  } catch (error: any) {
    console.error("Add family member error:", error);
    return { error: "Failed to create family member profile" };
  }
}
