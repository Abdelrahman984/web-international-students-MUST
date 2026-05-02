import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getHeroSlides, type HeroNavTreeItem } from "../services/cmsApi";
import { STATIC_MENU_ITEMS } from "./LinksBar";
import { useAuth } from "../context/AuthContext";

type SliderImage = {
  id: number | string;
  src: string;
  title: string;
};

type LocalHeroNavTreeItem = HeroNavTreeItem;

type MenuAccessRole = "public" | "visitor" | "college-member";

const STATIC_HERO_NAV_TREE: LocalHeroNavTreeItem[] = STATIC_MENU_ITEMS.map(
  (item) => ({
    title: item.label,
    url: item.to,
    target: "_self",
    accessRole: "public",
    children: (item.children || []).map((child) => ({
      title: child.label,
      url: child.to,
      target: "_self",
      accessRole: "public",
      children: [],
    })),
  }),
);

const normalizeNavPath = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) {
    return "/";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed === "home" || trimmed === "homepage") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const isMenuItemVisibleForRole = (
  accessRole: MenuAccessRole,
  userRole?: string | null,
): boolean => {
  if (accessRole === "public") {
    return true;
  }

  if (userRole === "admin") {
    return true;
  }

  if (accessRole === "visitor") {
    return userRole === "visitor" || userRole === "college-member";
  }

  return userRole === "college-member";
};

const filterVisibleHeroNavTree = (
  items: LocalHeroNavTreeItem[],
  userRole?: string | null,
): LocalHeroNavTreeItem[] => {
  return items
    .filter((item) => isMenuItemVisibleForRole(item.accessRole, userRole))
    .map((item) => ({
      ...item,
      children: filterVisibleHeroNavTree(item.children, userRole),
    }));
};

interface HeroNavMenuNodeProps {
  item: LocalHeroNavTreeItem;
  path: string[];
  activePath: string[];
  onActivatePath: (path: string[]) => void;
  level?: number;
}

function HeroNavMenuNode({
  item,
  path,
  activePath,
  onActivatePath,
  level = 0,
}: HeroNavMenuNodeProps) {
  const hasChildren = item.children.length > 0;
  const isTopLevel = level === 0;
  const itemPath = [...path, `${item.title}:${item.url}`];
  const isOpen = itemPath.every(
    (segment, index) => activePath[index] === segment,
  );
  const labelClassName = `transition-colors duration-300 ${isOpen ? "text-[#00AC5C]" : ""}`;

  const itemClassName = isTopLevel
    ? `px-6 h-12 rounded-full bg-white/20 backdrop-blur-md text-white text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 transition-all duration-300 ${
        isOpen
          ? "text-[#00AC5C] border-[#00AC5C]/60 bg-white/18 shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
          : "hover:text-[#00AC5C] hover:border-[#00AC5C]/55 hover:bg-white/20"
      }`
    : `w-full text-left px-4 py-2.5 rounded-xl border border-transparent bg-white/0 text-white font-bold transition-all duration-300 inline-flex items-center justify-between gap-2 whitespace-nowrap ${
        isOpen
          ? "text-[#00AC5C] bg-white/15 border-white/20"
          : "hover:text-[#00AC5C]"
      }`;

  const iconClassName = `h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#00AC5C]" : "rotate-0 text-current"}`;

  return (
    <li
      className={`group relative ${isTopLevel ? "shrink-0" : "w-full"}`}
      onMouseEnter={() => hasChildren && onActivatePath(itemPath)}
    >
      {item.target === "_blank" ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClassName}
        >
          <span className={labelClassName}>{item.title}</span>
          {hasChildren && (
            <ChevronDown
              aria-hidden="true"
              strokeWidth={2.6}
              className={iconClassName}
            />
          )}
        </a>
      ) : (
        <Link to={item.url} className={itemClassName}>
          <span className={labelClassName}>{item.title}</span>
          {hasChildren && (
            <ChevronDown
              aria-hidden="true"
              strokeWidth={2.6}
              className={iconClassName}
            />
          )}
        </Link>
      )}

      {hasChildren && (
        <ul
          className={`px-4 py-2 flex flex-col w-max min-w-[280px] bg-[#1f3769] border border-[#284884] rounded-xl shadow-xl z-30 transition-all duration-500 ease-out ${
            isTopLevel
              ? "absolute left-1/2 top-full mt-3 -translate-x-1/2"
              : "absolute left-full top-0 ml-3"
          } ${
            isOpen
              ? "opacity-100 visible translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 invisible translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          {item.children.map((child) => (
            <HeroNavMenuNode
              key={`${child.title}-${child.url}`}
              item={child}
              path={itemPath}
              activePath={activePath}
              onActivatePath={onActivatePath}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [heroNavTree] = useState<LocalHeroNavTreeItem[]>(STATIC_HERO_NAV_TREE);
  const [activeHeroNavPath, setActiveHeroNavPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const hoverResetTimeoutRef = useRef<number | null>(null);
  const heroNavViewportRef = useRef<HTMLDivElement | null>(null);
  const heroNavTrackRef = useRef<HTMLUListElement | null>(null);
  const [heroNavOffset, setHeroNavOffset] = useState(0);
  const [heroNavMaxOffset, setHeroNavMaxOffset] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const mappedSlides = await getHeroSlides();
        setSlides(
          mappedSlides.map((slide) => ({
            id: slide.id,
            src: slide.src,
            title: slide.title,
          })),
        );
        setCurrentIndex(0);
      } catch {
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    setActiveHeroNavPath([]);
  }, [heroNavTree.length]);

  const activateHeroNavPath = (path: string[]) => {
    if (hoverResetTimeoutRef.current !== null) {
      window.clearTimeout(hoverResetTimeoutRef.current);
      hoverResetTimeoutRef.current = null;
    }

    setActiveHeroNavPath(path);
  };

  const resetHeroNavPath = () => {
    hoverResetTimeoutRef.current = window.setTimeout(() => {
      setActiveHeroNavPath([]);
      hoverResetTimeoutRef.current = null;
    }, 200);
  };

  const normalizedHeroNavTree = heroNavTree.map((item) => ({
    ...item,
    url: item.target === "_self" ? normalizeNavPath(item.url) : item.url,
  }));
  const visibleHeroNavTree = filterVisibleHeroNavTree(
    normalizedHeroNavTree,
    user?.role?.type ?? null,
  );
  const canScrollHeroNavLeft = heroNavOffset > 1;
  const canScrollHeroNavRight = heroNavOffset < heroNavMaxOffset - 1;

  const recalculateHeroNavBounds = () => {
    const viewport = heroNavViewportRef.current;
    const track = heroNavTrackRef.current;

    if (!viewport || !track) {
      setHeroNavOffset(0);
      setHeroNavMaxOffset(0);
      return;
    }

    let contentWidth = track.scrollWidth;
    // Fallback manual sum to ensure robust calculation if flex scrollWidth under-reports
    let manualWidth = 0;
    for (let i = 0; i < track.children.length; i++) {
      manualWidth += track.children[i].getBoundingClientRect().width;
    }
    // add gap estimates
    manualWidth +=
      track.children.length > 1 ? (track.children.length - 1) * 20 : 0;
    manualWidth += 120; // safe buffer for padding

    contentWidth = Math.max(contentWidth, manualWidth);

    const maxOffset = Math.max(contentWidth - viewport.clientWidth, 0);
    setHeroNavMaxOffset(maxOffset);
    setHeroNavOffset((previousOffset) => Math.min(previousOffset, maxOffset));
  };

  const scrollHeroNav = (direction: "left" | "right") => {
    const viewport = heroNavViewportRef.current;
    if (!viewport) {
      return;
    }

    const step = Math.max(viewport.clientWidth * 0.72, 180);
    setHeroNavOffset((previousOffset) => {
      const nextOffset =
        direction === "left" ? previousOffset - step : previousOffset + step;
      return Math.min(Math.max(nextOffset, 0), heroNavMaxOffset);
    });
  };

  useEffect(() => {
    setLoadedImages({});

    slides.forEach((slide, index) => {
      const image = new Image();
      image.src = slide.src;
      image.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [index]: true }));
      };
    });
  }, [slides]);

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Defer one frame so measurements run after layout settles.
    const frameId = window.requestAnimationFrame(() => {
      recalculateHeroNavBounds();
    });

    const track = heroNavTrackRef.current;
    const viewport = heroNavViewportRef.current;
    const resizeObserver = new ResizeObserver(() => {
      recalculateHeroNavBounds();
    });

    if (track) {
      resizeObserver.observe(track);
    }

    if (viewport) {
      resizeObserver.observe(viewport);
    }

    const handleResize = () => recalculateHeroNavBounds();
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading, visibleHeroNavTree.length, slides.length]);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); //  كل 5 ثواني

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 9000);
  };

  const goToPrevSlide = () => {
    if (slides.length <= 1) {
      return;
    }

    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 9000);
  };

  const goToNextSlide = () => {
    if (slides.length <= 1) {
      return;
    }

    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 9000);
  };

  if (isLoading) {
    return (
      <div className="relative w-full mt-20 md:mt-24 h-[auto] min-h-[500px] lg:h-[75vh] lg:min-h-[600px] lg:max-h-[800px] bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[33.333333%] p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-4" />
          <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mb-3" />
          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mb-6" />
          <div className="h-10 w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        <div className="w-full lg:w-[66.666667%] p-4 lg:p-6 lg:pl-0 h-[350px] lg:h-auto flex flex-col">
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse flex-1" />
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full mt-20 md:mt-24 h-[auto] min-h-[500px] lg:h-[75vh] lg:min-h-[600px] lg:max-h-[800px] bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* BACKGROUND BLOBS FOR LEFT SIDE */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#00AC5C]/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-[15%] w-[300px] h-[300px] bg-[#1f3769]/5 rounded-full blur-[80px] translate-y-1/2 pointer-events-none" />

      {/* LEFT SECTION - CONTENT */}
      <div className="w-full lg:w-[33.333333%] flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-12 lg:py-10 z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 text-xs md:text-sm font-bold mb-6 tracking-wide">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AC5C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AC5C]"></span>
            </div>
            MUST International Portal
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-5">
            Your Global <br className="hidden lg:block" />
            Journey Begins <br className="hidden lg:block" />
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00AC5C] to-[#0b9a55]">
                At MUST
              </span>
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2 text-[#00AC5C]/20 z-0"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                />
              </svg>
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8 max-w-sm leading-relaxed font-medium">
            Explore world-class programs, dedicated advising, and a vibrant
            campus life tailored for international students.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-6">
            <Link
              to="/admission"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00AC5C] text-white font-bold text-center hover:bg-[#0b9a55] transition-all shadow-[0_8px_20px_rgba(0,172,92,0.25)] hover:shadow-[0_12px_25px_rgba(0,172,92,0.35)] hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
            >
              Start Admission
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact-us"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-1 shadow-sm text-sm"
            >
              Contact Support
            </Link>
          </div>

          {/* Quick Stats / Info Row */}
          <div className="flex items-center gap-6 pt-5 border-t border-slate-200 dark:border-slate-800/60 mt-5 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                10+
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                Nationalities
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800/60"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                3.4
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                Avg GPA
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800/60"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                25+
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                Advisors
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800/60"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                100%
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                Support
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SECTION - IMAGES */}
      <div className="w-full lg:w-[66.666667%] relative min-h-[350px] lg:min-h-0 p-4 lg:p-6 lg:pl-0 z-10 flex flex-col">
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 flex-1">
          {slides.map((slide, index) => (
            <motion.img
              key={slide.id}
              src={slide.src}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={false}
              animate={{
                opacity:
                  index === currentIndex &&
                  (loadedImages[index] || index === currentIndex)
                    ? 1
                    : 0,
                scale: index === currentIndex ? 1.05 : 1,
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          ))}

          {/* INNER OVERLAY FOR SLIDE TITLE */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f3769]/90 via-[#1f3769]/20 to-transparent z-10" />

          {/* UNIFIED BOTTOM CONTROL BAR */}
          <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/40 backdrop-blur-xl border border-white/20 p-4 md:py-3 md:px-6 rounded-3xl md:rounded-full shadow-2xl">
            {/* SLIDE TITLE */}
            {currentSlide && (
              <motion.div
                key={`title-${currentIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0"
              >
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#00AC5C] font-extrabold mb-0.5">
                  Highlight
                </p>
                <h3 className="text-white text-sm md:text-base font-bold leading-snug truncate w-full">
                  {currentSlide.title || "MUST Campus Life"}
                </h3>
              </motion.div>
            )}

            {/* SLIDER CONTROLS */}
            {slides.length > 1 && (
              <div className="flex items-center gap-4 md:gap-6 shrink-0">
                {/* Dots */}
                <div className="flex items-center gap-1.5 md:gap-2">
                  {slides.map((slide, index) => {
                    const isActive = index === currentIndex;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? "w-6 md:w-8 bg-[#00AC5C]"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-1.5 md:gap-2 border-l border-white/20 pl-4 md:pl-6">
                  <button
                    type="button"
                    onClick={goToPrevSlide}
                    aria-label="Previous slide"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors border border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextSlide}
                    aria-label="Next slide"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors border border-white/10"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
