import { Link } from "react-router-dom";

const programCards = [
  {
    title: "Undergraduate Programs",
    description:
      "Explore undergraduate study plans and resources for all specialties.",
    to: "/undergraduate",
  },
  {
    title: "Postgraduate Programs",
    description:
      "Browse postgraduate tracks, degrees, and related study plans.",
    to: "/postgraduate",
  },
];

export default function EducationalPrograms() {
  return (
    <div className="min-h-screen bg-white py-24 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <h1 className="mb-10 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Educational Programs
        </h1>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-2">
            {programCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-10 text-center no-underline shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                <h2 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                  {card.title}
                </h2>
                <p className="max-w-md text-base text-slate-600 dark:text-slate-300">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
