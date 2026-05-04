import { useEffect, useState, useRef } from "react";
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

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");
const supabaseApiKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  )?.trim() ||
  "";
const legacyHomeSectionsEndpoint = supabaseUrl
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

  const normalizedPath = path.replace(/^\/+/, "");
  const preferredBase = apiBaseUrl || supabaseUrl;

  if (!preferredBase) {
    return path;
  }

  if (normalizedPath.startsWith("storage/v1/object/public/")) {
    return `${preferredBase}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("storage/v1/object/")) {
    return `${preferredBase}/${normalizedPath.replace(
      "storage/v1/object/",
      "storage/v1/object/public/",
    )}`;
  }

  // Keep legacy Supabase bucket behavior for old payloads that only include bucket-relative paths.
  if (normalizedPath.startsWith("home-images/")) {
    return `${preferredBase}/storage/v1/object/public/${normalizedPath}`;
  }

  if (path.startsWith("/")) {
    return `${preferredBase}${path}`;
  }

  return `${preferredBase}/${normalizedPath}`;
};

const normalizeSectionRows = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as T[];
  }

  if (Array.isArray(record.items)) {
    return record.items as T[];
  }

  if (record.data && typeof record.data === "object") {
    return [record.data as T];
  }

  return [record as T];
};

const fetchFromApiEndpoint = async <T,>(
  sectionKey: string,
): Promise<T[] | null> => {
  if (!apiBaseUrl) {
    return null;
  }

  const encodedSectionKey = encodeURIComponent(sectionKey);
  const endpointCandidates = [
    `${apiBaseUrl}/api/home_sections?sectionKey=${encodedSectionKey}`,
    `${apiBaseUrl}/api/home_sections?section_key=${encodedSectionKey}`,
    `${apiBaseUrl}/api/home/sections?sectionKey=${encodedSectionKey}`,
    `${apiBaseUrl}/api/home_sections/${encodedSectionKey}`,
  ];

  const errors: string[] = [];

  for (const endpoint of endpointCandidates) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          continue;
        }

        const message = await response.text();
        errors.push(message || `${response.status} ${response.statusText}`);
        continue;
      }

      const payload = (await response.json()) as unknown;
      return normalizeSectionRows<T>(payload);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  return null;
};

const fetchFromLegacySupabaseEndpoint = async <T,>(
  sectionKey: string,
): Promise<T[]> => {
  if (!legacyHomeSectionsEndpoint || !supabaseApiKey) {
    throw new Error("Backend API configuration is missing.");
  }

  const queryParams = new URLSearchParams({
    select: "*",
    section_key: `eq.${sectionKey}`,
  });

  const response = await fetch(
    `${legacyHomeSectionsEndpoint}?${queryParams.toString()}`,
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

const fetchHomeSectionRows = async <T,>(sectionKey: string): Promise<T[]> => {
  const apiRows = await fetchFromApiEndpoint<T>(sectionKey);
  if (apiRows) {
    return apiRows;
  }

  return fetchFromLegacySupabaseEndpoint<T>(sectionKey);
};

import { useLanguage } from "../context/LanguageContext";

export default function HomePage() {
  const { t, language } = useLanguage();
  const [homeSections, setHomeSections] =
    useState<HomeSectionsState>(initialSectionsState);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState("");
  const [aboutVisible, setAboutVisible] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);
  const aboutContentRef = useRef<HTMLDivElement | null>(null);

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
        setSectionsError(
          t("loading_error") || "Could not load home sections right now.",
        );
      } finally {
        setIsLoadingSections(false);
      }
    };

    void fetchHomeSections();
  }, [t]);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el) {
      setAboutVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setAboutVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [homeSections.aboutSector]);

  useEffect(() => {
    const container = aboutContentRef.current;
    if (!container) return;

    const paragraphs = Array.from(
      container.querySelectorAll("p"),
    ) as HTMLParagraphElement[];
    if (!paragraphs.length) return;

    const timers: number[] = [];

    // Initialize hidden state for paragraphs so they animate in when aboutVisible is true
    paragraphs.forEach((p) => {
      p.style.transition = "opacity 550ms ease, transform 550ms ease";
      p.style.opacity = "0";
      p.style.transform = "translateY(12px)";
      (p.style as CSSStyleDeclaration & { willChange?: string }).willChange =
        "opacity, transform";
    });

    if (aboutVisible) {
      paragraphs.forEach((p, i) => {
        const t = window.setTimeout(() => {
          p.style.opacity = "1";
          p.style.transform = "translateY(0)";
        }, i * 200);
        timers.push(t);
      });
    } else {
      // hide them again when leaving viewport so re-entry replays the animation
      paragraphs.forEach((p, i) => {
        const t = window.setTimeout(() => {
          p.style.opacity = "0";
          p.style.transform = "translateY(12px)";
        }, i * 30);
        timers.push(t);
      });
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [aboutVisible, aboutSectorHtml]);

  return (
    <div className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <section className="">
          {isLoadingSections ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600 dark:border-slate-700 dark:bg-[#08132e] dark:text-slate-300">
              {t("loading_sections")}
            </div>
          ) : sectionsError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300">
              {sectionsError}
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {homeSections.aboutSector && (
                <article
                  ref={aboutRef}
                  className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#08132e] sm:p-8 transform transition-all duration-700`}
                >
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                        {t("about_the_sector")}
                      </p>
                      <div
                        ref={aboutContentRef}
                        className={`text-justify prose mt-4 max-w-none ${language === "ar" ? "border-r-4 pr-5 border-l-0" : "border-l-4 pl-5"} border-emerald-500 text-lg leading-8 text-slate-700 dark:prose-invert dark:text-slate-200`}
                        dangerouslySetInnerHTML={{
                          __html:
                            aboutSectorHtml ||
                            normalizeContentText(
                              homeSections.aboutSector.content_text,
                            ),
                        }}
                      />
                    </div>

                    <div className="mx-auto flex h-full w-full max-w-[320px] flex-col items-center justify-center text-center">
                      {aboutSectorImage ? (
                        <img
                          src={aboutSectorImage}
                          alt="Sector speaker"
                          className="h-52 w-52 rounded-2xl object-fill shadow-md transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {t("no_image")}
                        </div>
                      )}
                      <p className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                        {t("sector_head_name")}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("sector_head_title")}
                      </p>
                    </div>
                  </div>
                </article>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {homeSections.mission && (
                  <article className="rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:bg-slate-800/40 dark:shadow-none transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 relative overflow-hidden group">
                    <div
                      className={`absolute top-0 ${language === "ar" ? "left-0" : "right-0"} p-8 opacity-5 text-blue-500 group-hover:scale-110 transition-transform duration-500 pointer-events-none`}
                    >
                      <Target className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                          <Target className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400 mb-1">
                            {t("our_purpose")}
                          </p>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            {t("mission")}
                          </h3>
                        </div>
                      </div>

                      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/60">
                        <div
                          className="text-justify prose prose-base sm:prose-lg max-w-none text-slate-600 dark:prose-invert dark:text-slate-300 font-medium leading-relaxed prose-p:text-[1.1rem] sm:prose-p:text-[1.25rem] prose-p:leading-[1.8]"
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
                  <article className="rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 dark:border-slate-700/60 dark:bg-slate-800/40 dark:shadow-none transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 relative overflow-hidden group">
                    <div
                      className={`absolute top-0 ${language === "ar" ? "left-0" : "right-0"} p-8 opacity-5 text-cyan-500 group-hover:scale-110 transition-transform duration-500 pointer-events-none`}
                    >
                      <Globe2 className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-lg shadow-cyan-500/30">
                          <Globe2 className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-400 mb-1">
                            {t("our_future")}
                          </p>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            {t("vision")}
                          </h3>
                        </div>
                      </div>

                      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/60">
                        <div
                          className="text-justify prose prose-base sm:prose-lg max-w-none text-slate-600 dark:prose-invert dark:text-slate-300 font-medium leading-relaxed prose-p:text-[1.1rem] sm:prose-p:text-[1.25rem] prose-p:leading-[1.8]"
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
                        {homeSections.sectorPlan.title || t("sector_plan")}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {t("sector_plan")}
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
                        {t("open_plan_file")}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {t("no_plan_file")}
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
