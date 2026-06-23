# RxFlow — Smart Medication Management Platform

RxFlow is a connected medication intelligence platform designed to bridge the gap between patients, doctors, caregivers, and pharmacies. Unlike standard prescription reminder apps, RxFlow operates as an interactive AI medication companion and healthcare coordination ecosystem, optimizing patient adherence and streamlining clinical workflows.

---

## 🌟 Key Features

### 👤 Five Custom Portals
1. **Patient Portal**: Log daily doses, track adherence scores, view an AI-generated medication timeline ("Medication Journey"), upload electronic prescriptions, and request refills from local pharmacies.
2. **Doctor Dashboard**: Monitor patient compliance rates in real-time, view detailed log telemetry, issue electronic prescriptions, and set up specific medication instructions.
3. **Pharmacy Portal**: Receive digitized refill requests directly from patients, update fulfillment statuses (Pending, Processing, Ready, Delivered), and manage inventory.
4. **Caregiver Portal**: Monitor medication schedules for dependents, receive alerts for missed doses, and help manage treatment adherence.
5. **Admin Analytics Console**: Audit system event logs, manage user accounts, examine overall platform compliance telemetry, and trace critical actions via immutable audit logs.

### 🤖 Intelligent Features & Core Ecosystem
* **AI Medication Timeline**: Instead of a flat list, the platform builds a progressive "Medication Journey" timeline charting dosage adjustments, treatment starts, refills, and follow-ups.
* **AI Prescription Parser**: Upload image/PDF prescriptions to instantly extract medication details (dosage, frequency, duration) and generate structured daily routines automatically.
* **Smart Reminder Engine**: Multi-channel notification delivery (Web Push, Email, SMS) based on individual prescription schedules.
* **HIPAA & GDPR Grade Security**: Cryptographically signed access tokens, Edge Middleware role-based access control, encrypted medical data in transit and at rest, and immutable database audit logs.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Library**: [React 19](https://react.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Database & ORM**: [Prisma](https://www.prisma.io/) with [SQLite](https://www.sqlite.org/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Architecture

```
next-project/
├── prisma/
│   ├── dev.db               # SQLite local database
│   └── schema.prisma        # Prisma Database Schema
├── public/
│   ├── icon.svg             # Favicon and logo asset
│   └── ...
├── src/
│   ├── app/
│   │   ├── actions/         # Next.js Server Actions (Auth, Logouts, etc.)
│   │   ├── admin/           # Admin Analytics dashboard pages
│   │   ├── caregiver/       # Caregiver dashboard pages
│   │   ├── doctor/          # Doctor dashboard pages
│   │   ├── patient/         # Patient app pages (Schedules, Reminders, Logs)
│   │   ├── pharmacy/        # Pharmacy dispatch portal pages
│   │   ├── login/           # Unified sign-in
│   │   ├── register/        # Account registration
│   │   ├── globals.css      # Core styles & Tailwind v4 config
│   │   ├── layout.tsx       # Root layout containing viewport/favicon metadata
│   │   ├── page.tsx         # Responsive landing/marketing page
│   │   └── icon.svg         # Next.js App Router dynamic favicon
│   ├── components/          # Reusable component libraries
│   └── lib/                 # Core utilities (Auth helpers, Prisma Client)
```

---

## 🗄️ Database Schema & Models

The SQLite database structure managed via Prisma comprises the following core models:

* **User**: Handles core authentication and routing roles (`ADMIN`, `PATIENT`, `DOCTOR`, `PHARMACIST`, `CAREGIVER`).
* **Patient**: Tracks age, contact info, blood type, and insurance details. Maps to medication schedules, prescription history, dose logs, and caregivers.
* **Doctor**: Connects to the user profile; stores licensing details, specialization, and issued prescriptions.
* **Pharmacy**: Stores retail location info, licensure, and incoming pharmacy refill requests.
* **Prescription**: Contains digital document records, doctor instructions, and status tags (such as whether AI has successfully parsed the plan).
* **Medicine**: Belongs to a prescription; tracks dosages, schedules, refills, and remaining pill counts.
* **MedicationSchedule**: Defines specific dose times (e.g. `MORNING`, `EVENING`) and active state status.
* **DoseLog**: Records medication compliance statuses (`TAKEN`, `SNOOZED`, `SKIPPED`) with logs of timing and patient notes.
* **Reminder**: Tracks scheduled notifications across SMS, Email, and Push channels.
* **RefillRequest**: Forms submitted by patients, routed to pharmacies, and verified via fulfillment updates.
* **FamilyMember**: Tracks dependents or family relations associated with a Patient's profile.
* **Caregiver**: Connects care assistants to patients via a intermediate `PatientCaregiver` relation.
* **AuditLog**: Retains immutable system security event records.

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database and run migrations**:
   ```bash
   npx prisma db push
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Verify Application**:
   Open [http://localhost:3000](http://localhost:3000) on your browser to view the interactive platform.
