import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest, getCurrentApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdDetailCard } from './AdDetailCard';

type SliderImage = {
  id: number | string;
  src: string;
  title: string;
  description: string;
};

type HeroSlideApiItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  image?: {
    url?: string;
  };
  attributes?: {
    title?: string | null;
    description?: string | null;
    image?: {
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };
  };
};

type HeroSlidesApiResponse = {
  data?: HeroSlideApiItem[];
};

type HeroNavTarget = '_self' | '_blank';

type HeroNavTreeApiItem = {
  title?: string;
  url?: string;
  target?: HeroNavTarget;
  accessRole?: 'public' | 'visitor' | 'college-member';
  children?: HeroNavTreeApiItem[];
};

type HeroNavTreeItem = {
  title: string;
  url: string;
  target: HeroNavTarget;
  accessRole: 'public' | 'visitor' | 'college-member';
  children: HeroNavTreeItem[];
};

type MenuAccessRole = 'public' | 'visitor' | 'college-member';

const getStrapiBaseUrl = () => {
  const base = getCurrentApiBaseUrl().trim();
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const getSlideImageUrl = (item: HeroSlideApiItem): string | undefined => {
  return item.attributes?.image?.data?.attributes?.url || item.image?.url;
};

const getSlideTitle = (item: HeroSlideApiItem, index: number): string => {
  return item.attributes?.title || item.title || `Slide ${index + 1}`;
};

const getSlideDescription = (item: HeroSlideApiItem): string => {
  return (
    item.attributes?.description ||
    item.description ||
    'Explore this featured ad and discover more details by clicking Learn More.'
  );
};

const toAbsoluteUrl = (url: string, baseUrl: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (!baseUrl) {
    return url;
  }
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

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

const parseHeroNavTree = (payload: unknown): HeroNavTreeApiItem[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const extractFromMenuRecords = (records: unknown[]): HeroNavTreeApiItem[] => {
    const menuRecords = records.filter((entry) => entry && typeof entry === 'object') as Array<{
      title?: string;
      slug?: string;
      items?: unknown;
    }>;

    // Prefer the explicit hero-nav menu record when present.
    const heroNavRecord = menuRecords.find((entry) => entry.title === 'hero-nav');
    if (heroNavRecord && Array.isArray(heroNavRecord.items)) {
      return heroNavRecord.items as HeroNavTreeApiItem[];
    }

    const firstRecordWithItems = menuRecords.find((entry) => Array.isArray(entry.items));
    if (firstRecordWithItems && Array.isArray(firstRecordWithItems.items)) {
      return firstRecordWithItems.items as HeroNavTreeApiItem[];
    }

    return [];
  };

  const tryExtract = (candidate: unknown): HeroNavTreeApiItem[] => {
    if (Array.isArray(candidate)) {
      const fromMenuRecords = extractFromMenuRecords(candidate);
      if (fromMenuRecords.length > 0) {
        return fromMenuRecords;
      }
      return candidate as HeroNavTreeApiItem[];
    }
    if (!candidate || typeof candidate !== 'object') {
      return [];
    }

    const record = candidate as {
      ['hero-nav']?: unknown;
      menu?: unknown;
      data?: unknown;
    };

    if (Array.isArray(record['hero-nav'])) {
      return record['hero-nav'] as HeroNavTreeApiItem[];
    }

    if (record.menu) {
      const menuItems = tryExtract(record.menu);
      if (menuItems.length > 0) {
        return menuItems;
      }
    }

    if (record.data) {
      const dataItems = tryExtract(record.data);
      if (dataItems.length > 0) {
        return dataItems;
      }
    }

    return [];
  };

  return tryExtract(payload);
};

const normalizeHeroNavTree = (items: HeroNavTreeApiItem[]): HeroNavTreeItem[] => {
  return items
    .map((item): HeroNavTreeItem | null => {
      const title = item.title?.trim();
      const rawUrl = item.url?.trim() || '/';

      if (!title) {
        return null;
      }

      const target: HeroNavTarget = item.target === '_blank' ? '_blank' : '_self';
      const accessRole: MenuAccessRole =
        item.accessRole === 'visitor' || item.accessRole === 'college-member'
          ? item.accessRole
          : 'public';

      return {
        title,
        url: target === '_self' ? normalizeNavPath(rawUrl) : rawUrl,
        target,
        accessRole,
        children: normalizeHeroNavTree(Array.isArray(item.children) ? item.children : []),
      };
    })
    .filter((item): item is HeroNavTreeItem => item !== null);
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

const filterVisibleHeroNavTree = (items: HeroNavTreeItem[], userRole?: string | null): HeroNavTreeItem[] => {
  return items
    .filter((item) => isMenuItemVisibleForRole(item.accessRole, userRole))
    .map((item) => ({
      ...item,
      children: filterVisibleHeroNavTree(item.children, userRole),
    }));
};

interface HeroNavMenuNodeProps {
  item: HeroNavTreeItem;
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
      className={`group relative ${isTopLevel ? '' : 'w-full'}`}
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
  const [heroNavTree, setHeroNavTree] = useState<HeroNavTreeItem[]>([]);
  const [activeHeroNavPath, setActiveHeroNavPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedSlide, setSelectedSlide] = useState<SliderImage | null>(null);
  const hoverResetTimeoutRef = useRef<number | null>(null);
  const heroNavViewportRef = useRef<HTMLDivElement | null>(null);
  const heroNavTrackRef = useRef<HTMLUListElement | null>(null);
  const [heroNavOffset, setHeroNavOffset] = useState(0);
  const [heroNavMaxOffset, setHeroNavMaxOffset] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSlides = async () => {
      const baseUrl = getStrapiBaseUrl();

      try {
        const payload = await apiRequest<HeroSlidesApiResponse>(
          '/api/hero-slides?populate=image&filters[isActive][$eq]=true&sort=order:asc',
          { auth: false }
        );
        const apiItems = Array.isArray(payload?.data) ? payload.data : [];

        const mappedSlides = apiItems
          .map((item, index): SliderImage | null => {
            const imageUrl = getSlideImageUrl(item);

            if (!imageUrl) {
              return null;
            }

            return {
              id: item.id,
              src: toAbsoluteUrl(imageUrl, baseUrl),
              title: getSlideTitle(item, index),
              description: getSlideDescription(item),
            };
          })
          .filter((item): item is SliderImage => item !== null);

        setSlides(mappedSlides);
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
    const fetchHeroNavTree = async () => {
      try {
        const payload = await apiRequest<unknown>(
          '/api/tree-menus/menu',
          { auth: false }
        );

        const rawHeroNavTree = parseHeroNavTree(payload);
        const normalizedHeroNavTree = normalizeHeroNavTree(rawHeroNavTree);

        setHeroNavTree(normalizedHeroNavTree);
      } catch {
        setHeroNavTree([]);
      }
    };

    fetchHeroNavTree();
  }, []);

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

  const visibleHeroNavTree = filterVisibleHeroNavTree(heroNavTree, user?.role?.type ?? null);
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

    const maxOffset = Math.max(track.scrollWidth - viewport.clientWidth, 0);
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

    const handleResize = () => recalculateHeroNavBounds();
    window.addEventListener('resize', handleResize);

    return () => {
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

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-gray-800">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
      </div>
    );
  }

  return (
    <>
    <div className="relative w-full h-[70vh] md:h-screen overflow-visible">

      {/* IMAGE */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {slides.map((slide, index) => (
          <motion.img
            key={slide.id}
            src={slide.src}
            alt={slide.title}
            className="absolute inset-0 w-full h-full cursor-pointer object-cover"
            initial={false}
            animate={{ opacity: index === currentIndex && (loadedImages[index] || index === currentIndex) ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            onClick={() => setSelectedSlide(slide)}
          />
        ))}
      </div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60 z-10" />

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
            className="w-[55vw] md:w-[50vw] overflow-x-clip overflow-y-visible"
            style={{ marginInline: 'max(16px, 5vw)' }}
          >
            <ul
              ref={heroNavTrackRef}
              className="flex min-w-max flex-nowrap justify-start gap-2 sm:gap-3 md:gap-3 px-1 py-1"
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
    {selectedSlide && (
      <section className="bg-slate-50 px-4 py-10 dark:bg-[#0a111f]">
        <div className="mx-auto w-full max-w-[1200px]">
          <AdDetailCard
            image={selectedSlide.src}
            title={selectedSlide.title}
            description={selectedSlide.description}
            onLearnMore={() => window.alert(`Learn more about: ${selectedSlide.title}`)}
          />
        </div>
      </section>
    )}
    </>
  );
}