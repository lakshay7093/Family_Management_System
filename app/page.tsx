import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              Family-first productivity
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Manage chores, expenses, events and everyone in one place.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Stay in sync with the people who matter. Create shared tasks, track family
              expenses, plan events, and keep all important documents in one spot.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative aspect-4/3 w-85 overflow-hidden rounded-3xl bg-white shadow-lg">
              <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 via-sky-500/10 to-emerald-500/10" />
              <div className="relative h-full p-8">
                <div className="space-y-3">
                  <div className="h-3 w-24 rounded-full bg-slate-200" />
                  <div className="h-3 w-32 rounded-full bg-slate-200" />
                  <div className="h-3 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="mt-8 flex flex-col gap-4">
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Create shared tasks</p>
                    <p className="mt-1 text-sm text-slate-600">Assign everything to the right person.</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Track expenses</p>
                    <p className="mt-1 text-sm text-slate-600">See who paid what, and where the money went.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Family Members",
              description: "Manage member profiles and stay connected.",
              href: "/dashboard/members",
            },
            {
              title: "Tasks & Chores",
              description: "Create, assign and mark tasks as done.",
              href: "/dashboard/tasks",
            },
            {
              title: "Expenses",
              description: "Track shared bills and payments.",
              href: "/dashboard/expenses",
            },
            {
              title: "Events",
              description: "Plan family gatherings and reminders.",
              href: "/dashboard/events",
            },
            {
              title: "Documents",
              description: "Keep important files and links in one spot.",
              href: "/dashboard/documents",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                View
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </section>
      </section>
    </main>
  )
}
