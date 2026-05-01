import { Link } from "react-router-dom";
import { GoogleDriveLinkCard } from "../../../components/GoogleDriveLinkCard";

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
        <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
          <Link
            to="/academics"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to Academics
          </Link>
        </div>
        <h1 className="mb-10 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Educational Programs
        </h1>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-2">
            {programCards.map((card) => (
              <GoogleDriveLinkCard
                key={card.title}
                title={card.title}
                description={card.description}
                to={card.to}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
