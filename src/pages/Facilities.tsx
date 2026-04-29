import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PdfResourceCard } from "../components/PdfResourceCard";
import {
  getCurrentInternationalHandbookDocuments,
  getMustFacilitiesSections,
  renderRichText,
  type MustFacilitySectionItem,
} from "../services/cmsApi";

type FacilityPdfItem = {
  id: string;
  title: string;
  url: string;
};

type FacilitiesTab = "mustFacilities" | "internationalHandbook";

const getActiveTab = (tabValue: string | null): FacilitiesTab =>
  tabValue === "internationalHandbook"
    ? "internationalHandbook"
    : "mustFacilities";

function MustFacilitiesGallerySlider({
  imageUrls,
  title,
}: {
  imageUrls: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = imageUrls.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [imageUrls.join("|")]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="mt-8"
      tabIndex={0}
      aria-label="Facility gallery slider"
      onKeyDown={(event) => {
        if (!hasMultipleImages) return;
        if (event.key === "ArrowLeft") goPrev();
        if (event.key === "ArrowRight") goNext();
      }}
    >
      <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Gallery
      </h4>

      <div className="mt-4 relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <div className="aspect-[16/9] w-full">
          <img
            src={imageUrls[activeIndex]}
            alt={`${title} gallery ${activeIndex + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {imageUrls.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex
                    ? "bg-emerald-600"
                    : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {activeIndex + 1} / {imageUrls.length}
          </p>
        </div>
      ) : null}

      {hasMultipleImages ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {imageUrls.map((url, index) => (
            <button
              key={`thumb-${url}-${index}`}
              type="button"
              aria-label={`Select image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-xl border transition ${
                index === activeIndex
                  ? "border-emerald-500 ring-2 ring-emerald-400/40"
                  : "border-slate-200 hover:border-emerald-400 dark:border-slate-700"
              }`}
            >
              <img
                src={url}
                alt={`${title} thumbnail ${index + 1}`}
                className="h-20 w-28 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Facilities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<FacilityPdfItem[]>([]);
  const [mustFacilitySections, setMustFacilitySections] = useState<
    MustFacilitySectionItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  const activeTab = getActiveTab(searchParams.get("tab"));
  const isMustFacilitiesTab = activeTab === "mustFacilities";
  const sectionTitle = isMustFacilitiesTab
    ? "MUST Facilities"
    : "International Handbook";
  const selectedSectionId = searchParams.get("section");
  const selectedSection = isMustFacilitiesTab
    ? mustFacilitySections.find((item) => item.id === selectedSectionId) || null
    : null;

  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      setStatus("");

      try {
        if (isMustFacilitiesTab) {
          const rows = await getMustFacilitiesSections();
          setMustFacilitySections(rows);
          setResources([]);
          setStatus(rows.length ? "" : "No resources available yet.");
          return;
        }

        const rows = await getCurrentInternationalHandbookDocuments();
        setMustFacilitySections([]);
        setResources(
          rows.map((row) => ({
            id: row.id,
            title: row.title,
            url: row.fileUrl,
          })),
        );

        setStatus(rows.length ? "" : "No resources available yet.");
      } catch (error) {
        console.error(`Error fetching ${activeTab} resources:`, error);
        setStatus("Network error: Could not connect to backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFacilities();
  }, [activeTab, isMustFacilitiesTab]);

  const openMustFacilitySection = (sectionId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "mustFacilities");
    nextParams.set("section", sectionId);
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMustFacilitySection = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "mustFacilities");
    nextParams.delete("section");
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Facilities
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-slate-700 dark:text-slate-300">
            {sectionTitle}
          </h2>
        </header>

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">
            Loading {sectionTitle.toLowerCase()} resources from API...
          </div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : isMustFacilitiesTab && selectedSection ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeMustFacilitySection}
              className="mb-6 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              Back to MUST Facilities
            </button>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedSection.title}
            </h3>

            {selectedSection.contentHtml ? (
              <div
                className="prose mt-6 max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                dangerouslySetInnerHTML={{
                  __html: renderRichText(selectedSection.contentHtml),
                }}
              />
            ) : (
              <p className="mt-6 text-slate-600 dark:text-slate-300">
                No content available for this section.
              </p>
            )}

            {selectedSection.gallery_paths.length > 0 ? (
              <MustFacilitiesGallerySlider
                imageUrls={selectedSection.gallery_paths}
                title={selectedSection.title}
              />
            ) : null}
          </section>
        ) : isMustFacilitiesTab ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mustFacilitySections.map((section) => (
                <article
                  key={section.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {section.thumbnailUrl ? (
                      <img
                        src={section.thumbnailUrl}
                        alt={section.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No thumbnail available
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => openMustFacilitySection(section.id)}
                      className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      Read more
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <PdfResourceCard
                  key={resource.id}
                  title={resource.title}
                  url={resource.url}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
