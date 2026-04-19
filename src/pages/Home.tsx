import { Building2, Globe2, GraduationCap, Home as HomeIcon, Layers3, Wallet } from 'lucide-react';

const stats = [
  {
    label: 'Target Audience',
    value: 'International Students',
    Icon: Globe2,
    iconClassName: 'text-emerald-300',
    iconBgClassName: 'bg-emerald-500/20',
  },
  {
    label: 'Academic Fields',
    value: 'CS, IS, AI',
    Icon: GraduationCap,
    iconClassName: 'text-blue-300',
    iconBgClassName: 'bg-blue-500/20',
  },
  {
    label: 'Housing Support',
    value: 'Available',
    Icon: Building2,
    iconClassName: 'text-cyan-300',
    iconBgClassName: 'bg-cyan-500/20',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-[#0b1b45] p-8 shadow-xl sm:p-10 dark:border-slate-700">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] right-12 h-28 w-28 rounded-t-full bg-emerald-400/25" />
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Home</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-200">
              Welcome to the International Student Platform at the College of Information Technology.
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map(({ label, value, Icon, iconClassName, iconBgClassName }) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#08132e]"
            >
              <div className="flex items-center gap-4">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClassName}`}>
                  <Icon className={`h-5 w-5 ${iconClassName}`} />
                </span>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Quick Overview</h2>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Layers3 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Overview</h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    This website is designed for international students to explore academic options, track important
                    updates, and access services in one place. It provides central access to study plans, events, news,
                    resources, and student support information.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tuition</h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    The platform helps students compare tuition information, estimate costs, and review payment-related
                    details before enrollment.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Fields</h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    Students can explore the core academic fields offered by the college:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">CS</span>
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">IS</span>
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">AI</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                  <HomeIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Housing</h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    Our university provides housing options for students, including support for international students.
                    Housing information includes accommodation availability, campus location guidance, and contacts for
                    housing-related inquiries.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
