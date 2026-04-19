import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHeroSlides, type HeroNavTreeItem } from '../services/cmsApi';
import { STATIC_MENU_ITEMS } from './LinksBar';
import { useAuth } from '../context/AuthContext';

type SliderImage = {
  id: number | string;
  src: string;
  title: string;
};

type HeroNavTarget = '_self' | '_blank';

type LocalHeroNavTreeItem = HeroNavTreeItem;

type MenuAccessRole = 'public' | 'visitor' | 'college-member';

const STATIC_HERO_NAV_TREE: LocalHeroNavTreeItem[] = STATIC_MENU_ITEMS.map((item) => ({
  title: item.label,
  url: item.to,
  target: '_self',
  accessRole: 'public',
  children: (item.children || []).map((child) => ({
    title: child.label,
    url: child.to,
    target: '_self',
    accessRole: 'public',
    children: [],
  })),
}));

const normalizeNavPath = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) {
    return '/';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed === 'home' || trimmed === 'homepage') {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const isMenuItemVisibleForRole = (accessRole: MenuAccessRole, userRole?: string | null): boolean => {
  if (accessRole === 'public') {
    return true;
  }

  if (userRole === 'admin') {
    return true;
  }

  if (accessRole === 'visitor') {
    return userRole === 'visitor' || userRole === 'college-member';
  }

  return userRole === 'college-member';
};

const filterVisibleHeroNavTree = (items: LocalHeroNavTreeItem[], userRole?: string | null): LocalHeroNavTreeItem[] => {
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

function HeroNavMenuNode({ item, path, activePath, onActivatePath, level = 0 }: HeroNavMenuNodeProps) {
  const hasChildren = item.children.length > 0;
  const isTopLevel = level === 0;
  const itemPath = [...path, `${item.title}:${item.url}`];
  const isOpen = itemPath.every((segment, index) => activePath[index] === segment);
  const labelClassName = `transition-colors duration-300 ${isOpen ? 'text-[#00AC5C]' : ''}`;

  const itemClassName = isTopLevel
    ? `px-6 h-12 rounded-full bg-white/20 backdrop-blur-md text-white text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 transition-all duration-300 ${
        isOpen ? 'text-[#00AC5C] border-[#00AC5C]/60 bg-white/18 shadow-[0_12px_24px_rgba(0,0,0,0.25)]' : 'hover:text-[#00AC5C] hover:border-[#00AC5C]/55 hover:bg-white/20'
      }`
    : `w-full text-left px-4 py-2.5 rounded-xl border border-transparent bg-white/0 text-white font-bold transition-all duration-300 inline-flex items-center justify-between gap-2 ${
        isOpen ? 'text-[#00AC5C] bg-white/15 border-white/20' : 'hover:text-[#00AC5C]'
      }`;

  const iconClassName = `h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00AC5C]' : 'rotate-0 text-current'}`;

  return (
    <li
      className={`group relative ${isTopLevel ? 'shrink-0' : 'w-full'}`}
      onMouseEnter={() => hasChildren && onActivatePath(itemPath)}
    >
      {item.target === '_blank' ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClassName}
        >
          <span className={labelClassName}>{item.title}</span>
          {hasChildren && <ChevronDown aria-hidden="true" strokeWidth={2.6} className={iconClassName} />}
        </a>
      ) : (
        <Link to={item.url} className={itemClassName}>
          <span className={labelClassName}>{item.title}</span>
          {hasChildren && <ChevronDown aria-hidden="true" strokeWidth={2.6} className={iconClassName} />}
        </Link>
      )}

      {hasChildren && (
        <ul
          className={`px-4 py-2 flex flex-col min-w-[220px] bg-[#1f3769] border border-[#284884] rounded-xl shadow-xl z-30 transition-all duration-500 ease-out ${
            isTopLevel ? 'absolute left-1/2 top-full mt-3 -translate-x-1/2' : 'absolute left-full top-0 ml-3'
          } ${
            isOpen
              ? 'opacity-100 visible translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 invisible translate-y-2 scale-95 pointer-events-none'
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
        setSlides(mappedSlides.map((slide) => ({ id: slide.id, src: slide.src, title: slide.title })));
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
    url: item.target === '_self' ? normalizeNavPath(item.url) : item.url,
  }));
  const visibleHeroNavTree = filterVisibleHeroNavTree(normalizedHeroNavTree, user?.role?.type ?? null);
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
    manualWidth += track.children.length > 1 ? (track.children.length - 1) * 20 : 0;
    manualWidth += 120; // safe buffer for padding

    contentWidth = Math.max(contentWidth, manualWidth);

    const maxOffset = Math.max(contentWidth - viewport.clientWidth, 0);
    setHeroNavMaxOffset(maxOffset);
    setHeroNavOffset((previousOffset) => Math.min(previousOffset, maxOffset));
  };

  const scrollHeroNav = (direction: 'left' | 'right') => {
    const viewport = heroNavViewportRef.current;
    if (!viewport) {
      return;
    }

    const step = Math.max(viewport.clientWidth * 0.72, 180);
    setHeroNavOffset((previousOffset) => {
      const nextOffset = direction === 'left' ? previousOffset - step : previousOffset + step;
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
    recalculateHeroNavBounds();

    const track = heroNavTrackRef.current;
    let resizeObserver: ResizeObserver | null = null;
    
    if (track) {
      resizeObserver = new ResizeObserver(() => {
        recalculateHeroNavBounds();
      });
      resizeObserver.observe(track);
    }

    const handleResize = () => recalculateHeroNavBounds();
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [visibleHeroNavTree.length]);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000); //  كل 7 ثواني

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
      <div className="relative w-full h-[60vh] md:h-[86vh] overflow-hidden bg-gray-800">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[86vh] overflow-visible">

      {/* IMAGE */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {slides.map((slide, index) => (
          <motion.img
            key={slide.id}
            src={slide.src}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ opacity: index === currentIndex && (loadedImages[index] || index === currentIndex) ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* PHOTO ARROWS */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevSlide}
            aria-label="Previous slide"
            className="absolute left-8 md:left-14 lg:left-20 top-1/2 -translate-y-1/2 z-40 h-9 w-9 md:h-10 md:w-10 rounded-full border border-white/35 bg-black/25 text-white inline-flex items-center justify-center transition-all duration-300 hover:bg-black/45 hover:border-white/70"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <button
            type="button"
            onClick={goToNextSlide}
            aria-label="Next slide"
            className="absolute right-8 md:right-14 lg:right-20 top-1/2 -translate-y-1/2 z-40 h-9 w-9 md:h-10 md:w-10 rounded-full border border-white/35 bg-black/25 text-white inline-flex items-center justify-center transition-all duration-300 hover:bg-black/45 hover:border-white/70"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </>
      )}

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-x-0 top-[64%] md:top-[68%] -translate-y-1/2 z-30 flex flex-col items-center justify-center text-center text-white px-4"
      >
        {/* TITLE */}
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold">
          International Students Platform
        </h1>

        {/* SPACE */}
        <div className="h-10 md:h-10" />

        {/* HERO NAV */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => scrollHeroNav('left')}
            disabled={!canScrollHeroNavLeft}
            aria-label="Scroll menus left"
            className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-white/30 bg-white/15 backdrop-blur-xl text-white inline-flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={heroNavViewportRef}
            className="w-[75vw] md:w-[65vw] lg:w-[60vw] max-w-4xl overflow-x-clip overflow-y-visible"
            style={{ marginInline: 'max(16px, 2vw)' }}
          >
            <ul
              ref={heroNavTrackRef}
              className="flex min-w-[max-content] flex-nowrap justify-start gap-2 sm:gap-3 md:gap-4 px-2 py-2"
              style={{ transform: `translateX(-${heroNavOffset}px)`, transition: 'transform 300ms ease' }}
              onMouseLeave={resetHeroNavPath}
            >
              {visibleHeroNavTree.map((item) => (
                <HeroNavMenuNode
                  key={`${item.title}-${item.url}`}
                  item={item}
                  path={[]}
                  activePath={activeHeroNavPath}
                  onActivatePath={activateHeroNavPath}
                />
              ))}
              {/* Spacer strictly for scroll bounding allowance */}
              <li className="shrink-0 w-24 md:w-32 invisible h-px pointer-events-none" aria-hidden="true"></li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => scrollHeroNav('right')}
            disabled={!canScrollHeroNavRight}
            aria-label="Scroll menus right"
            className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-white/30 bg-white/15 backdrop-blur-xl text-white inline-flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              index === currentIndex
                ? 'bg-[#00AC5C] scale-125'
                : 'bg-white/60'
            }`}
          />
        ))}
      </div>

    </div>
  );
}