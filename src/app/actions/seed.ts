"use server";

import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function seedDemoDataAction() {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT" || !user.patient) {
    return { error: "Unauthorized" };
  }

  const patientId = user.patient.id;

  try {
    // 1. Clean existing patient medical records to prevent duplicates
    await db.prescription.deleteMany({ where: { patientId } });
    await db.medicationSchedule.deleteMany({ where: { patientId } });
    await db.doseLog.deleteMany({ where: { patientId } });
    await db.refillRequest.deleteMany({ where: { patientId } });
    await db.familyMember.deleteMany({ where: { patientId } });

    // 2. Find or Create a Mock Doctor user
    let doctorUser = await db.user.findFirst({
      where: { role: "DOCTOR" },
      include: { doctor: true },
    });

    if (!doctorUser) {
      // Create a doctor user
      doctorUser = await db.user.create({
        data: {
          name: "Dr. Alexander Fleming, MD",
          email: "doctor.demo@rxflow.ai",
          passwordHash: "demo-password-hash",
          role: "DOCTOR",
          doctor: {
            create: {
              specialization: "Cardiology & Primary Care",
              licenseNumber: "MD-98765432",
              phone: "+1 (555) 123-4567",
              hospital: "Metro Health General Hospital",
              bio: "Specializing in hypertension, diabetes management, and preventive cardiology.",
            },
          },
        },
        include: { doctor: true },
      });
    }

    // 3. Find or Create a Mock Pharmacy user
    let pharmacyUser = await db.user.findFirst({
      where: { role: "PHARMACIST" },
      include: { pharmacy: true },
    });

    if (!pharmacyUser) {
      pharmacyUser = await db.user.create({
        data: {
          name: "Dr. Clara Barton, PharmD",
          email: "pharmacy.demo@rxflow.ai",
          passwordHash: "demo-password-hash",
          role: "PHARMACIST",
          pharmacy: {
            create: {
              storeName: "RxFlow Central Pharmacy",
              licenseNumber: "RX-998877",
              address: "100 Medical Center Parkway",
              phone: "+1 (555) 987-6543",
              city: "Metro City",
            },
          },
        },
        include: { pharmacy: true },
      });
    }

    const doctorId = doctorUser.doctor!.id;
    const pharmacyId = pharmacyUser.pharmacy!.id;

    // 4. Create Active Prescriptions
    const prescription1 = await db.prescription.create({
      data: {
        patientId,
        doctorId,
        instructions: "Take medications with food. Stay hydrated.",
        isExtracted: true,
        aiPlanCreated: true,
      },
    });

    // 5. Create Medicines
    // Metformin (for diabetes) - remaining is low to trigger refill automation
    const medicineMetformin = await db.medicine.create({
      data: {
        prescriptionId: prescription1.id,
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "90 days",
        totalQuantity: 60,
        remainingQuantity: 6, // Low quantity! Will finish in 3 days.
        refillCount: 2,
        isRefillable: true,
      },
    });

    // Vitamin D3 (for general health) - high remaining
    const medicineVitaminD = await db.medicine.create({
      data: {
        prescriptionId: prescription1.id,
        name: "Vitamin D3",
        dosage: "1000 IU",
        frequency: "Once daily at night",
        duration: "30 days",
        totalQuantity: 30,
        remainingQuantity: 25,
        refillCount: 1,
        isRefillable: false,
      },
    });

    const prescription2 = await db.prescription.create({
      data: {
        patientId,
        doctorId,
        instructions: "Take Lisinopril in the morning. Check blood pressure daily.",
        isExtracted: true,
        aiPlanCreated: true,
      },
    });

    // Lisinopril (for blood pressure) - low remaining, triggers refill automation
    const medicineLisinopril = await db.medicine.create({
      data: {
        prescriptionId: prescription2.id,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily in morning",
        duration: "60 days",
        totalQuantity: 30,
        remainingQuantity: 3, // Low quantity! Will finish in 3 days.
        refillCount: 3,
        isRefillable: true,
      },
    });

    // 6. Create Schedules
    // Metformin: Morning & Evening
    const scheduleMetforminMorning = await db.medicationSchedule.create({
      data: {
        patientId,
        medicineId: medicineMetformin.id,
        timeOfDay: "MORNING",
        specificTime: "08:00",
        dosage: "1 tablet (500mg)",
        instructions: "Take with morning meal",
        status: "ACTIVE",
      },
    });

    const scheduleMetforminEvening = await db.medicationSchedule.create({
      data: {
        patientId,
        medicineId: medicineMetformin.id,
        timeOfDay: "EVENING",
        specificTime: "20:00",
        dosage: "1 tablet (500mg)",
        instructions: "Take with evening meal",
        status: "ACTIVE",
      },
    });

    // Vitamin D: Night
    const scheduleVitaminD = await db.medicationSchedule.create({
      data: {
        patientId,
        medicineId: medicineVitaminD.id,
        timeOfDay: "NIGHT",
        specificTime: "21:00",
        dosage: "1 capsule (1000 IU)",
        instructions: "Take before sleep",
        status: "ACTIVE",
      },
    });

    // Lisinopril: Morning
    const scheduleLisinopril = await db.medicationSchedule.create({
      data: {
        patientId,
        medicineId: medicineLisinopril.id,
        timeOfDay: "MORNING",
        specificTime: "08:00",
        dosage: "1 tablet (10mg)",
        instructions: "Take on empty stomach",
        status: "ACTIVE",
      },
    });

    // 7. Seed Past Adherence logs (last 7 days) to make charts look phenomenal
    const scheduleIds = [
      scheduleMetforminMorning.id,
      scheduleMetforminEvening.id,
      scheduleVitaminD.id,
      scheduleLisinopril.id,
    ];

    const today = new Date();
    for (let i = 7; i > 0; i--) {
      const logDate = new Date();
      logDate.setDate(today.getDate() - i);

      // Metformin Morning - mostly taken
      await db.doseLog.create({
        data: {
          scheduleId: scheduleMetforminMorning.id,
          patientId,
          loggedAt: new Date(logDate.setHours(8, 15, 0)),
          status: Math.random() > 0.15 ? "TAKEN" : "SKIPPED",
        },
      });

      // Metformin Evening - sometimes skipped/snoozed
      await db.doseLog.create({
        data: {
          scheduleId: scheduleMetforminEvening.id,
          patientId,
          loggedAt: new Date(logDate.setHours(20, 30, 0)),
          status: Math.random() > 0.2 ? "TAKEN" : "SNOOZED",
        },
      });

      // Vitamin D3 - mostly taken
      await db.doseLog.create({
        data: {
          scheduleId: scheduleVitaminD.id,
          patientId,
          loggedAt: new Date(logDate.setHours(21, 10, 0)),
          status: Math.random() > 0.1 ? "TAKEN" : "SKIPPED",
        },
      });

      // Lisinopril - mostly taken
      await db.doseLog.create({
        data: {
          scheduleId: scheduleLisinopril.id,
          patientId,
          loggedAt: new Date(logDate.setHours(8, 5, 0)),
          status: Math.random() > 0.1 ? "TAKEN" : "SKIPPED",
        },
      });
    }

    // 8. Add Family Members
    await db.familyMember.create({
      data: {
        patientId,
        name: "Robert Connor",
        relation: "SPOUSE",
        dob: "1982-04-12",
        gender: "MALE",
        phone: "+1 (555) 765-4321",
      },
    });

    // 8b. Add a Mock Caregiver user and associate with patient
    let caregiverUser = await db.user.findFirst({
      where: { role: "CAREGIVER" },
      include: { caregiver: true },
    });

    if (!caregiverUser) {
      caregiverUser = await db.user.create({
        data: {
          name: "John Connor (Caregiver)",
          email: "caregiver.demo@rxflow.ai",
          passwordHash: "demo-password-hash",
          role: "CAREGIVER",
          caregiver: {
            create: {
              phone: "+1 (555) 765-4321",
            },
          },
        },
        include: { caregiver: true },
      });
    }

    // Link caregiver to patient
    const linkExists = await db.patientCaregiver.findUnique({
      where: {
        patientId_caregiverId: {
          patientId,
          caregiverId: caregiverUser.caregiver!.id,
        },
      },
    });

    if (!linkExists) {
      await db.patientCaregiver.create({
        data: {
          patientId,
          caregiverId: caregiverUser.caregiver!.id,
        },
      });
    }

    // 9. Add Audit Log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "SEED_DEMO_DATA",
        details: "Instantiated comprehensive mock profile for dashboard visualization and linked John Connor as Caregiver.",
      },
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/medications");
    revalidatePath("/patient/family");
    revalidatePath("/caregiver/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Seed error:", error);
    return { error: "Failed to seed demo data: " + error.message };
  }
}
