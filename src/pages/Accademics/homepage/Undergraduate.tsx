import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NewStudyPlanResources from "../../../components/NewStudyPlanResources";
import { undergradStudyPlanConfig } from "../../../components/newStudyPlanResourcesMockData";
import { getManyFileLinks, getStudyPlansRow } from "../../../services/cmsApi";

const mapPlanFiles = (files: unknown, idPrefix: string, titlePrefix: string) =>
  getManyFileLinks(files, idPrefix)
    .filter((resource) => resource.url !== "#")
    .map((resource, index, list) => ({
      ...resource,
      title: list.length > 1 ? `${titlePrefix} ${index + 1}` : titlePrefix,
    }));

export default function Undergraduate() {
  const [config, setConfig] = useState<any>(undergradStudyPlanConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const attrs = await getStudyPlansRow();

        setConfig({
          mode: "undergrad-specialties",
          title: "Study Plans",
          specialties: {
            cs: {
              label: "Computer Science",
              resourcesByCurriculum: {
                old: mapPlanFiles(
                  attrs.undergrad_cs_old_curriculum,
                  "ug-cs-old",
                  "CS - Old",
                ),
                new: mapPlanFiles(
                  attrs.undergrad_cs_new_curriculum,
                  "ug-cs-new",
                  "CS - New",
                ),
              },
            },
            general: {
              label: "General",
              resourcesByCurriculum: {
                old: mapPlanFiles(
                  attrs.undergrad_general_old_curriculum,
                  "ug-general-old",
                  "General - Old",
                ),
                new: mapPlanFiles(
                  attrs.undergrad_general_new_curriculum,
                  "ug-general-new",
                  "General - New",
                ),
              },
            },
            is: {
              label: "Information System",
              resourcesByCurriculum: {
                old: mapPlanFiles(
                  attrs.undergrad_is_old_curriculum,
                  "ug-is-old",
                  "IS - Old",
                ),
                new: mapPlanFiles(
                  attrs.undergrad_is_new_curriculum,
                  "ug-is-new",
                  "IS - New",
                ),
              },
            },
            ai: {
              label: "Artificial Intelligence",
              resourcesByCurriculum: {
                old: mapPlanFiles(
                  attrs.undergrad_ai_old_curriculum,
                  "ug-ai-old",
                  "AI - Old",
                ),
                new: mapPlanFiles(
                  attrs.undergrad_ai_new_curriculum,
                  "ug-ai-new",
                  "AI - New",
                ),
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">
        <div className="sticky top-28 z-[100] mb-8 flex justify-start">
          <Link
            to="/educational-programs"
            className="group inline-flex items-center gap-2 rounded-full bg-[#002147] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-md backdrop-blur-md transition-all hover:bg-[#003366] hover:shadow-lg active:scale-95 dark:bg-blue-900 dark:hover:bg-blue-800 no-underline"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Programs
          </Link>
        </div>

        <div className="mb-12 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Undergraduate Studies
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore our diverse range of undergraduate programs, study plans, and resources tailored for your success.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="animate-pulse text-emerald-600 font-medium dark:text-emerald-400">
                Loading study plans...
              </p>
            </div>
          </div>
        ) : (
          <NewStudyPlanResources config={config} />
        )}
      </div>
    </div>
  );
}
