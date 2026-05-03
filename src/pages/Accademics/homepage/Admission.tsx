import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ArrowLeft,
  Download,
  AlertCircle,
  GraduationCap,
  ClipboardList,
  FileCheck,
  FileText,
} from "lucide-react";
import {
  getAdmissionSectionByKey,
  type AdmissionSectionItem,
  type AdmissionSectionKey,
} from "../../../services/cmsApi";

type AdmissionSectionConfig = {
  key: AdmissionSectionKey;
  title: string;
  icon: React.ElementType;
  description: string;
};

const admissionSections: AdmissionSectionConfig[] = [
  {
    key: "how-to-apply",
    title: "How To Apply",
    icon: ClipboardList,
    description: "Step-by-step guide to submitting your application",
  },
  {
    key: "required-documents",
    title: "Requirement Document",
    icon: FileCheck,
    description: "List of necessary paperwork and certificates",
  },
  {
    key: "external-transfer-requirements",
    title: "External Transfer Requirements",
    icon: GraduationCap,
    description: "Guidelines for students transferring from other institutions",
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
    <section className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Admission
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore application steps and required admission documents. Find
            everything you need to start your journey with us.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : status ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="font-medium">{status}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {admissionSections.map((section) => {
              const isOpen = openSection === section.key;
              const sectionData = sectionRows[section.key];
              const steps = sectionData?.steps || [];
              const attachments = sectionData?.attachments || [];
              const hasSteps = steps.length > 0;
              const hasAttachments = attachments.length > 0;
              const Icon = section.icon;

              return (
                <div
                  key={section.key}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-emerald-200 bg-white shadow-lg shadow-emerald-100/50 dark:border-emerald-900/50 dark:bg-slate-900 dark:shadow-emerald-900/20"
                      : "border-slate-200 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : section.key)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isOpen
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-bold transition-colors ${
                            isOpen
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {section.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                      }`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isOpen ? "-rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/50">
                          {hasSteps ? (
                            <div className="space-y-6">
                              {steps.map((step, index) => (
                                <div
                                  key={`${section.key}-${index}`}
                                  className="flex gap-4"
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                    {index + 1}
                                  </div>
                                  <p className="pt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : hasAttachments ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 no-underline"
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50 transition-colors">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-slate-800 line-clamp-2 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {attachment.title}
                                    </h3>
                                    <span className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                      <Download className="mr-1 h-3 w-3" />{" "}
                                      Download
                                    </span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                                <FileText className="h-6 w-6 text-slate-400" />
                              </div>
                              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                No information available at the moment.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
