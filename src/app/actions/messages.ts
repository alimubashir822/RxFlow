"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(receiverId: string, content: string) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  if (!content.trim()) {
    return { error: "Message content cannot be empty" };
  }

  try {
    const msg = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
      },
    });

    revalidatePath("/pharmacy/messages");
    revalidatePath("/patient/ai-assistant"); // or patient messages route if separate
    return { success: true, message: msg };
  } catch (error: any) {
    console.error("Send message error:", error);
    return { error: "Failed to send message" };
  }
}
