import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

const stats = [
  { label: 'Fast reporting', value: 'Report issues in seconds' },
  { label: 'Clear tracking', value: 'See ticket progress live' },
  { label: 'Smart routing', value: 'Send work orders to staff' },
];

export default function Home() {
  const user = getCurrentUser();
  if (user) {
    if (user.role === 'admin') redirect('/dashboard/admin');
    if (user.role === 'technician') redirect('/dashboard/technician');
    redirect('/dashboard/student');
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 hero-background" />
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10 lg:py-16">
        <header className="mb-12 flex items-center justify-between sm:mb-16">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 shadow-sm shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 overflow-hidden">
              <img
                src="/logo.png"
                alt="HostelCare logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">HostelCare</p>
              <p className="text-xs text-slate-400">Hostel maintenance made simple</p>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-10 lg:grid-cols-[1.4fr_0.95fr] lg:items-center">
          <section className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Hostel operations
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Efficient hostel care, from report to repair.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              A polished system for students, administrators, and technicians to manage hostel repairs with clear tickets,
              live status updates, and fast resolution.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>

          </section>

          <aside className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Welcome back</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Sign in to manage hostel requests</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use your credentials to access student, technician, or admin dashboards.
                </p>
              </div>

              <LoginForm />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
