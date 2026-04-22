import { LoginForm } from "@/components/providers/login-form";

export default function LoginPage() {
  return (
    <main className="surface-glow surface-grid flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_30px_80px_rgba(17,46,62,0.12)] backdrop-blur lg:p-12">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-4 py-1 text-sm font-medium text-primary">
              Clarix Water Intelligence
            </div>
            <div className="space-y-4">
              <p className="font-display text-5xl leading-tight tracking-tight text-slate-900 lg:text-6xl">
                Field-first water intelligence for defensible consulting work.
              </p>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Capture structured audits, convert gaps into risk-backed findings,
                and produce polished management plans and reports without losing
                momentum on site.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Guided audits with autosave",
                "Assistive T1/T2/T3 risk logic",
                "Editable plan and report outputs",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,38,54,0.1)] lg:p-10">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Secure Sign In
            </p>
            <h1 className="font-display text-3xl text-slate-900">
              Start today&apos;s site work.
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              This prototype uses a local demo session. Any email and password
              combination will sign you in and persist on this device.
            </p>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
