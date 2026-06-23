"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, comparePassword, signToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACIST", "CAREGIVER"]),
  // Extra role-specific fields
  storeName: z.string().optional(), // For pharmacist
  licenseNumber: z.string().optional(), // For pharmacist/doctor
  specialization: z.string().optional(), // For doctor
  phone: z.string().optional(), // For caregiver/general
});

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // Sign session JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("rxflow_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Redirect depends on role
    // Return redirect URL instead of calling redirect() in try-catch
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const role = (formData.get("role") as string) || "";
  const storeName = (formData.get("storeName") as string) || undefined;
  const licenseNumber = (formData.get("licenseNumber") as string) || undefined;
  const specialization = (formData.get("specialization") as string) || undefined;
  const phone = (formData.get("phone") as string) || undefined;

  const result = registerSchema.safeParse({
    name,
    email,
    password,
    role,
    storeName,
    licenseNumber,
    specialization,
    phone,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email is already registered" };
    }

    const passwordHash = await hashPassword(password);

    // Create user and profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

      if (role === "PATIENT") {
        await tx.patient.create({
          data: {
            userId: newUser.id,
          },
        });
      } else if (role === "DOCTOR") {
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            specialization: specialization || "General Medicine",
            licenseNumber: licenseNumber || "LIC-PENDING",
          },
        });
      } else if (role === "PHARMACIST") {
        await tx.pharmacy.create({
          data: {
            userId: newUser.id,
            storeName: storeName || `${name}'s Pharmacy`,
            licenseNumber: licenseNumber || "LIC-PENDING",
          },
        });
      } else if (role === "CAREGIVER") {
        await tx.caregiver.create({
          data: {
            userId: newUser.id,
            phone: phone || null,
          },
        });
      }

      return newUser;
    });

    // Sign session JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("rxflow_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("rxflow_session");
  redirect("/login");
}
