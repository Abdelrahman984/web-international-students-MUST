import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ActivitiesSection from '../components/ActivitiesSection';
import { AdDetailCard } from '../components/AdDetailCard';
import { apiClient } from '../services/api';
import type { ActivityType, NewsCardItem } from '../services/cmsApi';
import { resolveMediaUrl } from '../utils/media';

type ActivityRouteConfig = {
  title: string;
  subtitle: string;
  activityType?: ActivityType;
};

const ACTIVITY_ROUTE_MAP: Record<string, ActivityRouteConfig> = {
  '/activities': {
    title: 'Student Activities',
    subtitle: 'Discover campus activities across sports, cultural, art, and student clubs.',
  },
  '/cultural': {
    title: 'Cultural Activities',
    subtitle: 'Cultural programs and events for international students.',
    activityType: 'cultural',
  },
  '/sports': {
    title: 'Sports Activities',
    subtitle: 'Sports activities and competitions on campus.',
    activityType: 'sport',
  },
  '/art': {
    title: 'Art Activities',
    subtitle: 'Art-focused activities and creative initiatives.',
    activityType: 'art',
  },
  '/student-clubs': {
    title: 'Student Clubs',
    subtitle: 'Student club activities and community programs.',
    activityType: 'student club',
  },
};

export default function ActivitiesPage() {
  const location = useLocation();
  const [allActivities, setAllActivities] = useState<NewsCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeConfig = useMemo(() => {
    return ACTIVITY_ROUTE_MAP[location.pathname] || ACTIVITY_ROUTE_MAP['/activities'];
  }, [location.pathname]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/activities');
        const data = response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const mapped: NewsCardItem[] = data.map((item: any) => ({
            id: item.id || '',
            title: item.title || '',
            description: item.description || '',
            imageUrl: resolveMediaUrl(item.image_url || item.imageUrl || ''),
            href: item.href || item.link || '#',
            activityType: item.activity_type || '',
          }));
          setAllActivities(mapped);
        } else {
          setAllActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setAllActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchActivities();
  }, []);

  const activities = useMemo(() => {
    if (!routeConfig.activityType) return allActivities;
    return allActivities.filter(
      (item) => item.activityType?.toLowerCase() === routeConfig.activityType?.toLowerCase()
    );
  }, [allActivities, routeConfig.activityType]);

  const featuredActivity = activities[0];
  const listActivities = activities.slice(1).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    href: item.href,
  }));

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{routeConfig.title}</h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">{routeConfig.subtitle}</p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            Loading activities...
          </div>
        ) : activities.length ? (
          <div className="space-y-8">
            {featuredActivity && (
              <AdDetailCard
                image={featuredActivity.imageUrl}
                title={featuredActivity.title}
                description={featuredActivity.description}
                href={featuredActivity.href}
              />
            )}

            {listActivities.length > 0 && (
              <ActivitiesSection
                title={routeConfig.title}
                subtitle={routeConfig.subtitle}
                items={listActivities}
              />
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No activities available yet.
          </div>
        )}
      </div>
    </div>
  );
}