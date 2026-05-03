import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">

        <div className="mb-12 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Educational Programs
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Discover our comprehensive range of academic programs designed to
            prepare you for success.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
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
