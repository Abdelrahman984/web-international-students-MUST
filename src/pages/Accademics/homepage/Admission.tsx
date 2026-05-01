import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAdmissionSectionByKey,
  type AdmissionSectionItem,
  type AdmissionSectionKey,
} from "../../../services/cmsApi";

type AdmissionSectionConfig = {
  key: AdmissionSectionKey;
  title: string;
};

const admissionSections: AdmissionSectionConfig[] = [
  { key: "how-to-apply", title: "How To Apply" },
  { key: "required-documents", title: "Requirement Document" },
  {
    key: "external-transfer-requirements",
    title: "External Transfer Requirements",
  },
];

export default function Admission() {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [openSection, setOpenSection] = useState<AdmissionSectionKey | null>(
    "how-to-apply",
  );
  const [sectionRows, setSectionRows] = useState<
    Partial<Record<AdmissionSectionKey, AdmissionSectionItem | null>>
  >({});

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const rows = await Promise.all(
          admissionSections.map((section) =>
            getAdmissionSectionByKey(section.key),
          ),
        );

        const filteredRows = rows.filter(
          (row): row is AdmissionSectionItem =>
            !!row &&
            admissionSections.some((section) => section.key === row.sectionKey),
        );

        const mapped = rows.reduce<
          Partial<Record<AdmissionSectionKey, AdmissionSectionItem | null>>
        >((accumulator, _, index) => {
          const sectionKey = admissionSections[index].key;
          accumulator[sectionKey] =
            filteredRows.find((row) => row.sectionKey === sectionKey) || null;
          return accumulator;
        }, {});

        setSectionRows(mapped);
      } catch (error) {
        console.error("Error fetching admission sections:", error);
        setStatus("Network error: Could not load admission sections.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSections();
  }, []);

  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
          <Link
            to="/academics"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to Academics
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Admission
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Explore application steps and required admission documents.
        </p>

        {isLoading ? (
          <div className="mt-8 animate-pulse text-emerald-600 dark:text-emerald-400">
            Loading admission sections...
          </div>
        ) : status ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-slate-700 dark:border-slate-700 dark:text-slate-300">
            {status}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {admissionSections.map((section) => {
              const isOpen = openSection === section.key;
              const sectionData = sectionRows[section.key];
              const steps = sectionData?.steps || [];
              const attachments = sectionData?.attachments || [];
              const hasSteps = steps.length > 0;
              const hasAttachments = attachments.length > 0;

              return (
                <div
                  key={section.key}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : section.key)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {section.title}
                    </h2>
                    <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                        {hasSteps ? (
                          <ol className="list-decimal space-y-2 pl-5 text-slate-700 dark:text-slate-200">
                            {steps.map((step, index) => (
                              <li key={`${section.key}-${index}`}>{step}</li>
                            ))}
                          </ol>
                        ) : hasAttachments ? (
                          <ul className="space-y-2">
                            {attachments.map((attachment) => (
                              <li key={attachment.id}>
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-600 dark:text-emerald-300 dark:decoration-emerald-700 dark:hover:text-emerald-200"
                                >
                                  {attachment.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">
                            No steps available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
