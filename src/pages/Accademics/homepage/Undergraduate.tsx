import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="py-24 bg-white min-h-screen dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <Link
            to="/educational-programs"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Undergraduate Studies
          </h1>
        </div>
        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">
            Loading Plans...
          </div>
        ) : (
          <NewStudyPlanResources config={config} />
        )}
      </div>
    </div>
  );
}
