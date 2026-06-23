import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PharmacyMessagesClient from "@/components/pharmacy/PharmacyMessagesClient";

export default async function PharmacyMessagesPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "PHARMACIST" || !user.pharmacy) {
    redirect("/login");
  }

  // Fetch all patients with their user objects
  const patients = await db.patient.findMany({
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  // Fetch all messages linked to this pharmacist
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <PharmacyMessagesClient
      currentUserId={user.id}
      patients={patients}
      messages={messages}
    />
  );
}
