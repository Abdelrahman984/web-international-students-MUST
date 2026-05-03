import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">
        <div className="sticky top-28 z-[100] mb-8 flex justify-start">
          <Link
            to="/educational-programs"
            className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-slate-100 hover:shadow-md hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white no-underline"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Programs
          </Link>
        </div>

        <div className="mb-12 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Postgraduate Programs
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Advance your career with our Master's, Ph.D., and Professional Degree programs.
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
