import { useCmsData } from "../../../hooks/useCmsData";
import { Link } from "react-router-dom";
import { PdfResourceCard } from "../../../components/PdfResourceCard";

type AdvisingPdfItem = {
  title: string;
  url: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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
const resourcesBucket =
  (import.meta.env.VITE_SUPABASE_RESOURCES_FILES_BUCKET as string | undefined)
    ?.trim()
    .replace(/^\/+|\/+$/g, "") || "resources-files";
const legacyAcademicAdvisingEndpoint = supabaseUrl
  ? `${supabaseUrl}/rest/v1/academic_advising`
  : "";

const getString = (
  source: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const resolveApiAssetUrl = (rawUrl: string): string => {
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const baseUrl = apiBaseUrl || supabaseUrl || "";
  const storageHost = supabaseUrl || baseUrl;

  if (!baseUrl) {
    return rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  }

  const normalizedPath = rawUrl.replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/v1/object/public/")) {
    return `${storageHost}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("storage/v1/object/")) {
    return `${storageHost}/${normalizedPath.replace(
      "storage/v1/object/",
      "storage/v1/object/public/",
    )}`;
  }

  if (normalizedPath.startsWith("academic-advising/")) {
    if (!apiBaseUrl && supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${resourcesBucket}/${normalizedPath}`;
    }

    return `${baseUrl}/${normalizedPath}`;
  }

  if (rawUrl.startsWith("/")) {
    return `${baseUrl}${rawUrl}`;
  }

  return `${baseUrl}/${rawUrl}`;
};

const extractFileUrl = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return null;
  }

  const directUrl = getString(value, [
    "url",
    "href",
    "link",
    "file_path",
    "filePath",
    "file_url",
    "fileUrl",
    "resource_url",
    "resourceUrl",
    "path",
  ]);
  if (directUrl) {
    return directUrl;
  }

  const nestedData = value.data;
  if (isRecord(nestedData)) {
    const nestedDataUrl = extractFileUrl(nestedData);
    if (nestedDataUrl) {
      return nestedDataUrl;
    }

    const nestedAttributes = nestedData.attributes;
    if (isRecord(nestedAttributes)) {
      const nestedAttrUrl = extractFileUrl(nestedAttributes);
      if (nestedAttrUrl) {
        return nestedAttrUrl;
      }
    }
  }

  const attributes = value.attributes;
  if (isRecord(attributes)) {
    return extractFileUrl(attributes);
  }

  return null;
};

const toAdvisingPdfItem = (
  rawItem: unknown,
  index: number,
): AdvisingPdfItem | null => {
  if (!isRecord(rawItem)) {
    return null;
  }

  const title =
    getString(rawItem, ["title", "name", "label", "document_title"]) ||
    `Academic Advising Guide ${index + 1}`;

  const url =
    extractFileUrl(rawItem.file) ||
    extractFileUrl(rawItem.document) ||
    extractFileUrl(rawItem.attachment) ||
    extractFileUrl(rawItem);

  if (!url) {
    return null;
  }

  return {
    title,
    url: resolveApiAssetUrl(url),
  };
};

const extractList = (source: unknown): unknown[] => {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isRecord(source)) {
    return [];
  }

  const listKeys = [
    "pdfs",
    "documents",
    "guides",
    "resources",
    "files",
    "items",
    "academic_advising",
    "academicAdvising",
  ];

  for (const key of listKeys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (isRecord(value) && Array.isArray(value.data)) {
      return value.data;
    }
  }

  const dataValue = source.data;
  if (Array.isArray(dataValue)) {
    return dataValue;
  }

  if (isRecord(dataValue)) {
    const fromData = extractList(dataValue);
    if (fromData.length > 0) {
      return fromData;
    }

    const fromAttributes = extractList(dataValue.attributes);
    if (fromAttributes.length > 0) {
      return fromAttributes;
    }
  }

  const attributesValue = source.attributes;
  if (isRecord(attributesValue)) {
    const fromAttributes = extractList(attributesValue);
    if (fromAttributes.length > 0) {
      return fromAttributes;
    }
  }

  return [source];
};

const fetchAcademicAdvising = async (): Promise<AdvisingPdfItem[]> => {
  const fetchFromApiEndpoint = async (): Promise<unknown | null> => {
    if (!apiBaseUrl) {
      return null;
    }

    const endpointCandidates = [
      `${apiBaseUrl}/api/academic-advising`,
      `${apiBaseUrl}/api/academic-advising/resources`,
      `${apiBaseUrl}/api/advising/resources`,
      `${apiBaseUrl}/api/academicAdvising`,
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

        return (await response.json()) as unknown;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    return null;
  };

  const fetchFromLegacySupabaseEndpoint = async (): Promise<unknown> => {
    if (!legacyAcademicAdvisingEndpoint || !supabaseApiKey) {
      throw new Error("Backend API configuration is missing.");
    }

    const queryParams = new URLSearchParams({
      select: "*",
    });

    const response = await fetch(
      `${legacyAcademicAdvisingEndpoint}?${queryParams.toString()}`,
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
      throw new Error(
        message || "Failed to fetch academic advising resources.",
      );
    }

    return (await response.json()) as unknown;
  };

  const apiResponseData = await fetchFromApiEndpoint();
  const responseData =
    apiResponseData ?? (await fetchFromLegacySupabaseEndpoint());

  const items = extractList(responseData)
    .map((item, index) => toAdvisingPdfItem(item, index))
    .filter((item): item is AdvisingPdfItem => item !== null);

  return items;
};

export default function Advising() {
  const {
    data: academicAdvisingPdfs,
    loading,
    error,
  } = useCmsData(fetchAcademicAdvising, []);

  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <Link
          to="/advising?tab=resources"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
        >
          <span aria-hidden="true">←</span>
          Back to Advising Resources
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Academic Advising
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Download or open the official academic advising guides.
        </p>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Loading academic advising resources...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error.message || "Failed to load academic advising resources."}
          </div>
        ) : (academicAdvisingPdfs?.length || 0) > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {academicAdvisingPdfs?.map((item, index) => (
              <PdfResourceCard
                key={`${item.url}-${index}`}
                title={item.title}
                url={item.url}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            No academic advising documents are available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
