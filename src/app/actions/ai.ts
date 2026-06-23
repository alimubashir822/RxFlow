"use server";

import { getAuthUser } from "@/lib/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askAiAssistantAction(messages: ChatMessage[]) {
  const user = await getAuthUser();
  if (!user || user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const latestMessage = messages[messages.length - 1]?.content || "";
  const query = latestMessage.toLowerCase();

  // Custom mock database responses based on common keywords
  let reply = "";

  if (query.includes("amoxicillin")) {
    reply = `**Amoxicillin** is an antibiotic commonly prescribed to treat bacterial infections. 

**Standard Schedule Info:**
- Typically taken 2 or 3 times daily (every 8 to 12 hours) as prescribed.
- It is crucial to complete the entire course (e.g., 7 days) even if symptoms resolve earlier to prevent bacterial resistance.

**Usage Instructions:**
- Can be taken with or without food. If it causes stomach upset, taking it with a meal or snack is recommended.
- Drink a full glass of water with each dose.

*Disclaimer: I am your AI medication assistant, not a doctor. Please contact your prescribing physician or pharmacist for medical adjustments.*`;
  } else if (query.includes("lisinopril")) {
    reply = `**Lisinopril** is an ACE inhibitor commonly used to manage hypertension (high blood pressure) or congestive heart failure.

**Standard Schedule Info:**
- Usually taken once daily in the morning.
- Consistency is key: try to take it at the exact same time every day.

**Usage Instructions:**
- May be taken with or without food.
- It is recommended to check and log your blood pressure regularly. Avoid potassium supplements or salt substitutes containing potassium without consulting your doctor first.

*Disclaimer: I am your AI medication assistant, not a doctor. Please contact your prescribing physician or pharmacist for medical adjustments.*`;
  } else if (query.includes("metformin")) {
    reply = `**Metformin** is an oral diabetes medication that helps control blood sugar levels in type 2 diabetes.

**Standard Schedule Info:**
- Often taken twice daily, typically with your morning and evening meals.

**Usage Instructions:**
- **Always take with meals** to reduce gastrointestinal side effects (e.g., nausea, abdominal discomfort), which are common when starting.
- Stay hydrated and avoid excess alcohol intake while taking Metformin.

*Disclaimer: I am your AI medication assistant, not a doctor. Please contact your prescribing physician or pharmacist for medical adjustments.*`;
  } else if (query.includes("side effect") || query.includes("adverse")) {
    reply = `Side effects vary depending on the specific medication:
- **Antibiotics (e.g., Amoxicillin):** Nausea, diarrhea, mild rash.
- **Blood Pressure (e.g., Lisinopril):** Dry cough, dizziness, fatigue.
- **Diabetes (e.g., Metformin):** Stomach upset, metallic taste, diarrhea.

**What to do:**
- For mild symptoms, taking the medicine with food often helps.
- If you experience severe symptoms (e.g., difficulty breathing, swelling of the face/throat, severe hives), seek immediate emergency medical care.

*Disclaimer: I am your AI medication assistant, not a doctor. Always report adverse effects directly to your clinic.*`;
  } else if (query.includes("time") || query.includes("schedule")) {
    reply = `Based on your prescription:
- Take **morning medications** (like Lisinopril) immediately with or before breakfast.
- Take **twice-daily doses** (like Metformin) spaced 12 hours apart (with breakfast and dinner).
- Keep reminders active on your RxFlow portal. Consistently taking your medication at the same time daily maintains therapeutic drug levels in your bloodstream.

*Disclaimer: I am your AI medication assistant, not a doctor. Consult your pharmacist for specific drug-timing questions.*`;
  } else {
    reply = `Hello! I am your **RxFlow AI Medication Assistant**. I can help clarify:
- **General information** about common medicines (e.g., Metformin, Amoxicillin, Lisinopril).
- **Ideal administration timings** (with food vs empty stomach).
- **Standard side effect profiles** and compliance suggestions.

What medicine or schedule questions can I help you with today?

*Disclaimer: I do not provide medical diagnosis. If you are feeling unwell, consult a doctor immediately.*`;
  }

  // Simulate network lag slightly
  await new Promise((resolve) => setTimeout(resolve, 800));

  return { success: true, reply };
}
