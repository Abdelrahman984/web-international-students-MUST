import { useEffect, useState } from "react";
import {
  Building2,
  Download,
  Globe2,
  GraduationCap,
  Home as HomeIcon,
  Layers3,
  Target,
  Wallet,
} from "lucide-react";

const stats = [
  {
    label: "Target Audience",
    value: "International Students",
    Icon: Globe2,
    iconClassName: "text-emerald-300",
    iconBgClassName: "bg-emerald-500/20",
  },
  {
    label: "Academic Fields",
    value: "CS, IS, AI",
    Icon: GraduationCap,
    iconClassName: "text-blue-300",
    iconBgClassName: "bg-blue-500/20",
  },
  {
    label: "Housing Support",
    value: "Available",
    Icon: Building2,
    iconClassName: "text-cyan-300",
    iconBgClassName: "bg-cyan-500/20",
  },
];

type BasicHomeSection = {
  section_key: string;
  content_text: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

type SectorPlanSection = {
  section_key: string;
  title: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
};

type HomeSectionsState = {
  aboutSector: BasicHomeSection | null;
  mission: BasicHomeSection | null;
  vision: BasicHomeSection | null;
  sectorPlan: SectorPlanSection | null;
};

const initialSectionsState: HomeSectionsState = {
  aboutSector: null,
  mission: null,
  vision: null,
  sectorPlan: null,
};

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");
const supabaseApiKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  )?.trim() ||
  "";
const homeSectionsEndpoint = supabaseUrl
  ? `${supabaseUrl}/rest/v1/home_sections`
  : "";

const normalizeContentText = (value: string | null): string => {
  if (!value) {
    return "";
  }

  return value.replace(/&nbsp;/gi, " ").trim();
};

const sanitizeHtmlContent = (value: string | null): string => {
  if (!value) {
    return "";
  }

  const normalizedHtml = value.replace(/&nbsp;/gi, " ");
  let root: HTMLElement;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(normalizedHtml, "text/html");
    root = doc.body ?? document.createElement("div");
    if (!doc.body) {
      root.innerHTML = normalizedHtml;
    }
  } catch {
    root = document.createElement("div");
    root.innerHTML = normalizedHtml;
  }

  const allowedTags = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
    "A",
    "BLOCKQUOTE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "SPAN",
    "DIV",
  ]);

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName;

      if (tagName === "SCRIPT" || tagName === "STYLE") {
        element.remove();
        return;
      }

      if (!allowedTags.has(tagName)) {
        const parent = element.parentNode;
        if (!parent) {
          return;
        }

        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
        return;
      }

      for (const attr of Array.from(element.attributes)) {
        const attrName = attr.name.toLowerCase();

        if (tagName === "A" && attrName === "href") {
          const href = attr.value.trim();
          const isAllowedHref =
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("#") ||
            href.startsWith("/");

          if (!isAllowedHref) {
            element.removeAttribute(attr.name);
          }
          continue;
        }

        element.removeAttribute(attr.name);
      }

      if (tagName === "A") {
        const href = element.getAttribute("href");
        if (
          href &&
          (href.startsWith("http://") || href.startsWith("https://"))
        ) {
          element.setAttribute("target", "_blank");
          element.setAttribute("rel", "noopener noreferrer");
        }
      }
    }

    for (const child of Array.from(node.childNodes)) {
      walk(child);
    }
  };

  walk(root);
  return root.innerHTML.trim();
};

const resolveMediaUrl = (path: string | null): string | null => {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const storageBase = `${
    supabaseUrl || "https://qynenmfrntuicbrxvhqv.supabase.co"
  }/storage/v1/object/public/home-images`;
  const normalizedPath = path.replace(/^\/+/, "");

  return `${storageBase}/${normalizedPath}`;
};

const fetchHomeSectionRows = async <T,>(sectionKey: string): Promise<T[]> => {
  if (!homeSectionsEndpoint || !supabaseApiKey) {
    throw new Error("Supabase REST configuration is missing.");
  }

  const queryParams = new URLSearchParams({
    select: "*",
    section_key: `eq.${sectionKey}`,
  });

  const response = await fetch(
    `${homeSectionsEndpoint}?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        apikey: supabaseApiKey,
        Authorization: `Bearer ${supabaseApiKey}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to fetch ${sectionKey}`);
  }

  return (await response.json()) as T[];
};

export default function HomePage() {
  const [homeSections, setHomeSections] =
    useState<HomeSectionsState>(initialSectionsState);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState("");

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        setIsLoadingSections(true);
        setSectionsError("");

        const [aboutSectorRows, missionRows, visionRows, sectorPlanRows] =
          await Promise.all([
            fetchHomeSectionRows<BasicHomeSection>("about-sector"),
            fetchHomeSectionRows<BasicHomeSection>("mission"),
            fetchHomeSectionRows<BasicHomeSection>("vision"),
            fetchHomeSectionRows<SectorPlanSection>("sector-plan"),
          ]);

        setHomeSections({
          aboutSector: aboutSectorRows[0] || null,
          mission: missionRows[0] || null,
          vision: visionRows[0] || null,
          sectorPlan: sectorPlanRows[0] || null,
        });
      } catch (error) {
        console.error("Error fetching home sections:", error);
        setSectionsError("Could not load home sections right now.");
      } finally {
        setIsLoadingSections(false);
      }
    };

    void fetchHomeSections();
  }, []);

  const aboutSectorImage = resolveMediaUrl(
    homeSections.aboutSector?.image_path || null,
  );
  const aboutSectorHtml = sanitizeHtmlContent(
    homeSections.aboutSector?.content_text || null,
  );
  const missionHtml = sanitizeHtmlContent(
    homeSections.mission?.content_text || null,
  );
  const visionHtml = sanitizeHtmlContent(
    homeSections.vision?.content_text || null,
  );
  const sectorPlanFile = resolveMediaUrl(
    homeSections.sectorPlan?.file_path || null,
  );

  return (
    <div className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-[#0b1b45] p-8 shadow-xl sm:p-10 dark:border-slate-700">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] right-12 h-28 w-28 rounded-t-full bg-emerald-400/25" />
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Home
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-200">
              Welcome to the International Student Platform at the College of
              Information Technology.
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map(
            ({ label, value, Icon, iconClassName, iconBgClassName }) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#08132e]"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClassName}`}
                  >
                    <Icon className={`h-5 w-5 ${iconClassName}`} />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {value}
                    </p>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Quick Overview
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Layers3 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    System Overview
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    This website is designed for international students to
                    explore academic options, track important updates, and
                    access services in one place. It provides central access to
                    study plans, events, news, resources, and student support
                    information.
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Tuition
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    The platform helps students compare tuition information,
                    estimate costs, and review payment-related details before
                    enrollment.
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Fields
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    Students can explore the core academic fields offered by the
                    college:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
                      CS
                    </span>
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
                      IS
                    </span>
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
                      AI
                    </span>
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Housing
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                    Our university provides housing options for students,
                    including support for international students. Housing
                    information includes accommodation availability, campus
                    location guidance, and contacts for housing-related
                    inquiries.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-12">
          {isLoadingSections ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600 dark:border-slate-700 dark:bg-[#08132e] dark:text-slate-300">
              Loading home sections...
            </div>
          ) : sectionsError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300">
              {sectionsError}
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {homeSections.aboutSector && (
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e] sm:p-8">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                        About The Sector
                      </p>
                      <div
                        className="prose mt-4 max-w-none border-l-4 border-emerald-500 pl-5 text-lg leading-8 text-slate-700 dark:prose-invert dark:text-slate-200"
                        dangerouslySetInnerHTML={{
                          __html:
                            aboutSectorHtml ||
                            normalizeContentText(
                              homeSections.aboutSector.content_text,
                            ),
                        }}
                      />
                    </div>

                    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center text-center">
                      {aboutSectorImage ? (
                        <img
                          src={aboutSectorImage}
                          alt="Sector speaker"
                          className="h-52 w-52 rounded-2xl object-fill shadow-md"
                        />
                      ) : (
                        <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          No Image
                        </div>
                      )}
                      <p className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                        Asst. Lect. / Ayman S. Abdelaziz
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Head of International Students Sector
                      </p>
                    </div>
                  </div>
                </article>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {homeSections.mission && (
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                        <Target className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Mission
                        </h3>
                        <div
                          className="prose mt-3 max-w-none leading-7 text-slate-600 dark:prose-invert dark:text-slate-300"
                          dangerouslySetInnerHTML={{
                            __html:
                              missionHtml ||
                              normalizeContentText(
                                homeSections.mission.content_text,
                              ),
                          }}
                        />
                      </div>
                    </div>
                  </article>
                )}

                {homeSections.vision && (
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                        <Globe2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Vision
                        </h3>
                        <div
                          className="prose mt-3 max-w-none leading-7 text-slate-600 dark:prose-invert dark:text-slate-300"
                          dangerouslySetInnerHTML={{
                            __html:
                              visionHtml ||
                              normalizeContentText(
                                homeSections.vision.content_text,
                              ),
                          }}
                        />
                      </div>
                    </div>
                  </article>
                )}
              </div>

              {homeSections.sectorPlan && (
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {homeSections.sectorPlan.title || "Sector Plan"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Sector Plan
                      </p>
                    </div>

                    {sectorPlanFile ? (
                      <a
                        href={sectorPlanFile}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <Download className="h-4 w-4" />
                        Open Plan File
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        No plan file available yet.
                      </span>
                    )}
                  </div>
                </article>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
