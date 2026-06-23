import Link from "next/link";
import { Activity, Shield, Brain, Heart, Bell, MessageSquare, RefreshCw, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-slate-100 selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary live-indicator rounded-full" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent glow-text-primary">
            RxFlow
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#dashboards" className="hover:text-primary transition">Dashboards</a>
          <a href="#security" className="hover:text-primary transition">Security</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Neon Orb background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-4xl flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-border bg-brand-card/50 text-xs font-semibold tracking-wide text-primary uppercase">
              <span className="flex h-2 w-2 rounded-full bg-primary live-indicator" />
              Connected Healthcare Ecosystem
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
              Smart Medication Management <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-black">
                Powered by AI
              </span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-slate-400 font-light leading-relaxed">
              A digital medication companion connecting patients, doctors, and pharmacies. Never miss a dose, automate refill requests, and upload documents with instant AI processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <Link
                href="/register"
                className="bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold px-8 py-4 rounded-xl hover:opacity-95 transition shadow-xl shadow-primary/20 text-center"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="glass-card hover:bg-white/5 border border-brand-border text-slate-200 text-base font-semibold px-8 py-4 rounded-xl text-center"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboards Section */}
        <section id="dashboards" className="px-6 py-20 bg-slate-950/30 border-y border-brand-border relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                Four Custom Portals. One Connected Network.
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto font-light">
                RxFlow provides unique, dedicated interfaces tailored to each stakeholder in the healthcare cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Patient */}
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Patient Portal</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  Log daily doses, chat with AI, upload prescriptions, and send automatic refill requests directly to your pharmacy.
                </p>
                <div className="mt-auto pt-4 border-t border-brand-border">
                  <Link href="/login" className="text-xs text-primary font-semibold hover:underline">Access Patient Portal &rarr;</Link>
                </div>
              </div>

              {/* Doctor */}
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Doctor Dashboard</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  Monitor patient compliance, review detailed adherence metrics, upload electronic prescriptions, and write doctor instructions.
                </p>
                <div className="mt-auto pt-4 border-t border-brand-border">
                  <Link href="/login" className="text-xs text-secondary font-semibold hover:underline">Access Doctor Portal &rarr;</Link>
                </div>
              </div>

              {/* Pharmacy */}
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Pharmacy Portal</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  Receive digitized refill orders, process prescriptions, message patients directly, and manage order dispatch timelines.
                </p>
                <div className="mt-auto pt-4 border-t border-brand-border">
                  <Link href="/login" className="text-xs text-emerald-400 font-semibold hover:underline">Access Pharmacy Portal &rarr;</Link>
                </div>
              </div>

              {/* Admin */}
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Admin Console</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  Manage accounts, audit database event logs, analyze system adherence telemetry, and configure integrations.
                </p>
                <div className="mt-auto pt-4 border-t border-brand-border">
                  <Link href="/login" className="text-xs text-amber-400 font-semibold hover:underline">Access Admin Panel &rarr;</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              Next-Generation Features
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto font-light">
              Built on a HIPAA-compliant structure with AI enhancements to make medication management seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Brain className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">AI Prescription Parser</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Upload image or PDF prescriptions. The AI extracts medication details (dosage, frequency, duration) and builds a daily schedule automatically.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Bell className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Smart Reminder Engine</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Set up email, web-push, and SMS reminders to stay on top of doses. Get missed dose alerts for high-priority medications.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Refill Predictions</h4>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                The platform monitors medicine balances and warns you 5 days before a pill runs out, prompting a one-click refill request to pharmacies.
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="px-6 py-20 bg-slate-950/20 border-t border-brand-border">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              HIPAA & GDPR Standards
            </h2>
            <p className="text-slate-400 font-light leading-relaxed">
              We encrypt medical data in transit and at rest. Access tokens are cryptographically signed, role access is verified at the Edge Middleware level, and all changes generate immediate immutable Audit Logs.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border px-6 py-8 text-center text-xs text-slate-500 bg-brand-bg flex flex-col items-center gap-2">
        <p>&copy; {new Date().getFullYear()} RxFlow Inc. All rights reserved. Made for premium healthcare operations.</p>
        <p>
          <a
            href="https://www.medclinicx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition underline decoration-dotted"
          >
            Healthcare system by Med Clinic X
          </a>
        </p>
      </footer>
    </div>
  );
}
