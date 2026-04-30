import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewStudyPlanResources from "../../../components/NewStudyPlanResources";
import { postgradStudyPlanConfig } from "../../../components/newStudyPlanResourcesMockData";
import { getManyFileLinks, getStudyPlansRow } from "../../../services/cmsApi";

const mapPlanFiles = (files: unknown, idPrefix: string, titlePrefix: string) =>
  getManyFileLinks(files, idPrefix)
    .filter((resource) => resource.url !== "#")
    .map((resource, index, list) => ({
      ...resource,
      title: list.length > 1 ? `${titlePrefix} ${index + 1}` : titlePrefix,
    }));

const combineCurriculumFiles = (
  oldFiles: unknown,
  newFiles: unknown,
  idPrefix: string,
  programLabel: string,
) => ({
  old: mapPlanFiles(oldFiles, `${idPrefix}-old`, `${programLabel} - Old`),
  new: mapPlanFiles(newFiles, `${idPrefix}-new`, `${programLabel} - New`),
});

export default function Postgraduate() {
  const [config, setConfig] = useState<any>(postgradStudyPlanConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const attrs = await getStudyPlansRow();

        setConfig({
          mode: "degree-tracks",
          title: "Study Plans",
          tracks: {
            msc: {
              type: "research",
              label: "M. SC",
              resourcesBySpecialty: {
                CS: combineCurriculumFiles(
                  attrs.master_cs_old_curriculum,
                  attrs.master_cs_new_curriculum,
                  "pg-msc-cs",
                  "MSc Computer Science",
                ),
                IS: combineCurriculumFiles(
                  attrs.master_is_old_curriculum,
                  attrs.master_is_new_curriculum,
                  "pg-msc-is",
                  "MSc Information Systems",
                ),
                AI: combineCurriculumFiles(
                  attrs.master_ai_old_curriculum,
                  attrs.master_ai_new_curriculum,
                  "pg-msc-ai",
                  "MSc Artificial Intelligence",
                ),
              },
            },
            phd: {
              type: "research",
              label: "PH.D",
              resourcesBySpecialty: {
                CS: combineCurriculumFiles(
                  attrs.phd_cs_old_curriculum,
                  attrs.phd_cs_new_curriculum,
                  "pg-phd-cs",
                  "PhD Computer Science",
                ),
                IS: combineCurriculumFiles(
                  attrs.phd_is_old_curriculum,
                  attrs.phd_is_new_curriculum,
                  "pg-phd-is",
                  "PhD Information Systems",
                ),
                AI: combineCurriculumFiles(
                  attrs.phd_ai_old_curriculum,
                  attrs.phd_ai_new_curriculum,
                  "pg-phd-ai",
                  "PhD Artificial Intelligence",
                ),
              },
            },
            professional: {
              type: "professional",
              label: "Professional Degrees",
              resources: [
                ...mapPlanFiles(
                  attrs.diploma_big_data,
                  "pg-prof-big-data",
                  "Diploma - Big Data",
                ),
                ...mapPlanFiles(
                  attrs.diploma_applied_ai,
                  "pg-prof-applied-ai",
                  "Diploma - Applied AI",
                ),
                ...mapPlanFiles(
                  attrs.diploma_business_intelligence,
                  "pg-prof-business-intelligence",
                  "Diploma - Business Intelligence",
                ),
              ],
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
            Postgraduate Programs
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
