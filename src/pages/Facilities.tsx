// Facilities Page
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PdfResourceCard } from "../components/PdfResourceCard";
import { Pagination } from "../components/Pagination";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const scrollGallery = (direction: "left" | "right") => {
    if (galleryScrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      galleryScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

  const ITEMS_PER_PAGE = 9;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginatedMustFacilities = mustFacilitySections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalMustFacilitiesPages = Math.ceil(
    mustFacilitySections.length / ITEMS_PER_PAGE,
  );

  const paginatedResources = resources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalResourcesPages = Math.ceil(resources.length / ITEMS_PER_PAGE);

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
          <section className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {/* Sticky Back Button */}
            <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
              <button
                type="button"
                onClick={closeMustFacilitySection}
                className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30"
              >
                <i className="fa-solid fa-arrow-left text-lg" /> Back to
                Facilities
              </button>
            </div>

            <div className="mx-auto max-w-4xl">
              <h3 className="text-center text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-10 mt-4">
                {selectedSection.title}
              </h3>

              {selectedSection.contentHtml ? (
                <div
                  className="prose prose-xl mt-8 max-w-none text-left leading-[1.8] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-bold prose-a:text-emerald-600"
                  dangerouslySetInnerHTML={{
                    __html: renderRichText(selectedSection.contentHtml),
                  }}
                />
              ) : (
                <p className="mt-6 text-center text-xl text-slate-600 dark:text-slate-300">
                  No content available for this section.
                </p>
              )}
            </div>

            {selectedSection.gallery_paths &&
              selectedSection.gallery_paths.length > 0 && (
                <div className="mt-20 border-t border-slate-200 pt-16 dark:border-slate-800">
                  <h4 className="mb-10 text-center text-[2rem] font-bold text-[#009b4d]">
                    Gallery
                  </h4>

                  {/* Horizontal Swipe Gallery (Matches Main Cards exactly: 3 per row on Desktop, 2 on Tablet, 1 on Mobile) */}
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Scroll left"
                      onClick={() => scrollGallery("left")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur transition hover:bg-white md:group-hover:inline-flex dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div
                      ref={galleryScrollRef}
                      className="flex w-full snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {selectedSection.gallery_paths.map((url, i) => (
                        <div
                          key={i}
                          className="relative flex-none w-[85vw] md:w-[calc(50%-16px)] lg:w-[calc(33.333333%-21.33px)] snap-start overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group/item"
                          onClick={() => setSelectedImage(url)}
                        >
                          <div className="aspect-[16/10] w-full overflow-hidden">
                            <img
                              src={url}
                              alt={`${selectedSection.title} gallery ${i + 1}`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      aria-label="Scroll right"
                      onClick={() => scrollGallery("right")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur transition hover:bg-white md:group-hover:inline-flex dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
          </section>
        ) : isMustFacilitiesTab ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedMustFacilities.map((section) => {
                const plainText = section.contentHtml
                  ? section.contentHtml.replace(/<[^>]+>/g, "").trim()
                  : "";
                const excerpt =
                  plainText.length > 80
                    ? plainText.substring(0, 80) + "..."
                    : plainText;

                return (
                  <article
                    key={section.id}
                    className="group relative h-[350px] w-full overflow-hidden rounded-[16px] shadow-lg cursor-pointer"
                    onClick={() => openMustFacilitySection(section.id)}
                  >
                    {/* Background Image */}
                    {section.thumbnailUrl ? (
                      <img
                        src={section.thumbnailUrl}
                        alt={section.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500">
                        <i className="fa-solid fa-building text-4xl" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-colors duration-500 group-hover:from-[#11203d]/95 group-hover:via-[#162a52]/90 group-hover:to-[#162a52]/80" />

                    {/* Content Container */}
                    <div className="absolute inset-x-0 bottom-0 flex h-full flex-col items-center justify-end p-6">
                      {/* Icon that appears on hover (if we wanted to hardcode an icon, but we don't have it in DB, so we'll just show the title) */}

                      <div className="flex w-full flex-col items-center transform translate-y-[80px] transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:-translate-y-8">
                        <h3 className="text-center text-2xl font-black uppercase tracking-wider text-white drop-shadow-md transition-transform duration-500">
                          {section.title}
                        </h3>

                        {/* Excerpt container (height expands on hover) */}
                        <div className="mt-4 grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:grid-rows-[1fr] w-full">
                          <div className="overflow-hidden">
                            <p className="text-center text-base font-medium leading-relaxed text-slate-100 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100 px-2">
                              {excerpt}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="mt-6 text-xl font-bold text-emerald-500 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hover:text-emerald-400 drop-shadow-md"
                        >
                          See More
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalMustFacilitiesPages}
              onPageChange={handlePageChange}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {paginatedResources.map((resource) => (
                <PdfResourceCard
                  key={resource.id}
                  title={resource.title}
                  url={resource.url}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalResourcesPages}
              onPageChange={handlePageChange}
            />
          </section>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            <X className="h-10 w-10" />
          </button>
          <img
            src={selectedImage}
            alt="Expanded gallery view"
            className="max-h-[90vh] max-w-[90vw] object-contain animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
