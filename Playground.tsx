import { useEffect, useState } from 'react';
import AcademicStaffProfileCard, { AcademicStaffProfileCardProps } from '../components/AcademicStaffProfileCard';
import EventsNewsSection from '../components/EventsNewsCarousels';
import Schedules from './Accademics/homepage/Schedules'; // Ensure this path is correct for your file

import NewStudyPlanResources from '../components/NewStudyPlanResources';
import { postgradStudyPlanConfig, undergradStudyPlanConfig } from '../components/newStudyPlanResourcesMockData';
import ResourcesComponent from '../components/ResourcesComponent';
import { mockGenericReources } from '../components/genericResourcesMockData';
import { PlaygroundVideo } from '../components/PlaygroundVideo';
import ActivitiesSection from '../components/ActivitiesSection';
import { playgroundVideoItems, videoSrc } from '../data/playgroundVideos';
import { playgroundActivities } from '../data/playgroundActivities';

export default function Playground() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  
  // Initialize with your friend's mock data, then overwrite with live Strapi data
  const [undergradConfig, setUndergradConfig] = useState<any>(undergradStudyPlanConfig);
  const [postgradConfig, setPostgradConfig] = useState<any>(postgradStudyPlanConfig);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_CMS_URL || import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
        
        const [staffRes, eventsRes, newsRes, studyPlansRes] = await Promise.all([
          fetch(`${baseUrl}/api/academic-staffs?populate=*`),
          fetch(`${baseUrl}/api/events?populate=*`),
          fetch(`${baseUrl}/api/news-items?populate=*`),
          fetch(`${baseUrl}/api/study-plans?populate=*`),
        ]);

        const [staffJson, eventsJson, newsJson, studyPlansJson] = await Promise.all([
          staffRes.json(),
          eventsRes.json(),
          newsRes.json(),
          studyPlansRes.json(),
        ]);

        // Helper function moved to top of try block so all sections can use it
        const getFileUrl = (mediaField: any) => {
          const path = mediaField?.url || mediaField?.data?.attributes?.url;
          return path ? (path.startsWith('http') ? path : `${baseUrl}${path}`) : '#';
        };

        // 1. Format Staff
        if (staffJson.data) {
          const formattedStaff = staffJson.data.map((item: any) => {
            const attrs = item.attributes || item;
            const mediaImage = attrs.imageUrl || attrs.image || attrs.avatar;
            const mediaCv = attrs.cvUrl || attrs.cvurl || attrs.cvDocument || attrs.cv;
            
            const imagePath = mediaImage?.url || mediaImage?.data?.attributes?.url;
            const cvPath = mediaCv?.url || mediaCv?.data?.attributes?.url;

            return {
              name: attrs.name,
              role: attrs.role,
              specialty: attrs.specialty || '',
              email: attrs.email || '',
              bio: attrs.bio || '',
              cvLabel: attrs.cvLabel || attrs.cvlabel || 'Download CV (PDF)',
              qualifications: attrs.qualifications || [],
              researchDirections: attrs.researchDirections || [],
              experience: attrs.experience || [],
              imageUrl: imagePath ? (imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`) : '/accademics/image-not-hero.png',
              cvUrl: cvPath ? (cvPath.startsWith('http') ? cvPath : `${baseUrl}${cvPath}`) : '#'
            };
          });
          setStaffList(formattedStaff);
        }

        // 2. Format Events
        if (eventsJson.data) {
          const formattedEvents = eventsJson.data.map((item: any) => {
            const attrs = item.attributes || item;
            const media = attrs.imageUrl || attrs.image;
            const imagePath = media?.url || media?.data?.attributes?.url;
            
            return {
              id: item.id.toString(),
              title: attrs.title,
              description: attrs.description,
              day: attrs.day,
              month: attrs.month,
              timeRange: attrs.timeRange,
              href: attrs.href || '#',
              imageUrl: imagePath ? (imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`) : undefined
            };
          });
          setEventsList(formattedEvents);
        }

        // 3. Format News
        if (newsJson.data) {
          const formattedNews = newsJson.data.map((item: any) => {
            const attrs = item.attributes || item;
            const media = attrs.imageUrl || attrs.image;
            const imagePath = media?.url || media?.data?.attributes?.url;
            
            return {
              id: item.id.toString(),
              title: attrs.title,
              description: attrs.description,
              href: attrs.href || '#',
              imageUrl: imagePath ? (imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`) : '/accademics/news/news-1.jpg'
            };
          });
          setNewsList(formattedNews);
        }

        // 4. Format Study Plans
        if (studyPlansJson.data && studyPlansJson.data.length > 0) {
          const attrs = studyPlansJson.data[0].attributes || studyPlansJson.data[0];

          const getMultipleFiles = (mediaArray: any) => {
            const items = mediaArray?.data || mediaArray || [];
            if (!Array.isArray(items)) return [];
            return items.map((file: any, index: number) => {
              const path = file?.attributes?.url || file?.url;
              const finalPath = path ? (path.startsWith('http') ? path : `${baseUrl}${path}`) : '#';
              const name = file?.attributes?.name || file?.name || `Professional Diploma ${index + 1}`;
              return { id: `prof-${index}`, title: name, url: finalPath };
            });
          };

          setUndergradConfig({
            mode: 'undergrad-specialties',
            title: 'Study Plans (Undergrad)',
            specialties: {
              cs: {
                label: 'Computer Science',
                resourcesByCurriculum: {
                  old: attrs.Undergrad_CS_Old_Curriculum ? [{ id: 'ug-cs-old', title: 'CS - Old Curriculum', url: getFileUrl(attrs.Undergrad_CS_Old_Curriculum) }] : [],
                  new: attrs.Undergrad_CS_New_Curriculum ? [{ id: 'ug-cs-new', title: 'CS - New Curriculum', url: getFileUrl(attrs.Undergrad_CS_New_Curriculum) }] : [],
                },
              },
              is: {
                label: 'Information System',
                resourcesByCurriculum: {
                  old: attrs.Undergrad_IS_Old_Curriculum ? [{ id: 'ug-is-old', title: 'IS - Old Curriculum', url: getFileUrl(attrs.Undergrad_IS_Old_Curriculum) }] : [],
                  new: attrs.Undergrad_IS_New_Curriculum ? [{ id: 'ug-is-new', title: 'IS - New Curriculum', url: getFileUrl(attrs.Undergrad_IS_New_Curriculum) }] : [],
                },
              },
              ai: {
                label: 'Artificial Intelligence',
                resourcesByCurriculum: {
                  old: attrs.Undergrad_AI_Old_Curriculum ? [{ id: 'ug-ai-old', title: 'AI - Old Curriculum', url: getFileUrl(attrs.Undergrad_AI_Old_Curriculum) }] : [],
                  new: attrs.Undergrad_AI_New_Curriculum ? [{ id: 'ug-ai-new', title: 'AI - New Curriculum', url: getFileUrl(attrs.Undergrad_AI_New_Curriculum) }] : [],
                },
              },
            },
          });

          setPostgradConfig({
            mode: 'degree-tracks',
            title: 'Study Plans (Postgrad)',
            tracks: {
              msc: {
                type: 'research',
                label: 'M. SC',
                resourcesBySpecialty: {
                  CS: attrs.Postgrad_CS ? [{ id: 'pg-msc-cs', title: 'MSc Computer Science', url: getFileUrl(attrs.Postgrad_CS) }] : [],
                  IS: attrs.Postgrad_AI ? [{ id: 'pg-msc-is', title: 'MSc Artificial Intelligence', url: getFileUrl(attrs.Postgrad_AI) }] : [],
                },
              },
              phd: {
                type: 'research',
                label: 'PH.D',
                resourcesBySpecialty: {
                  CS: attrs.Postgrad_CS ? [{ id: 'pg-phd-cs', title: 'PhD Computer Science', url: getFileUrl(attrs.Postgrad_CS) }] : [],
                  IS: attrs.Postgrad_AI ? [{ id: 'pg-phd-is', title: 'PhD Artificial Intelligence', url: getFileUrl(attrs.Postgrad_AI) }] : [],
                },
              },
              professional: {
                type: 'professional',
                label: 'Professional Degrees',
                resources: getMultipleFiles(attrs.Professional_diplomas),
              },
            },
          });
        }

      } catch (error) {
        console.error('Error fetching data from Strapi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="w-full bg-[#070d19] pb-16">
      
      {/* --- Academic Staff Section --- */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-12 sm:px-8 lg:px-10">
        <h1 className="mb-6 text-center text-3xl font-bold text-emerald-400 sm:text-left">UI Playground</h1>
        <p className="mb-8 text-center text-slate-300 sm:text-left">
          Live preview of the Collections loaded from the Strapi Backend.
        </p>

        <div className="mb-10 space-y-10">
          <h2 className="text-lg font-semibold text-slate-200">Help videos</h2>
          {playgroundVideoItems.map((item) => (
            <PlaygroundVideo
              key={item.fileName}
              src={videoSrc(item.fileName)}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <ActivitiesSection items={playgroundActivities} />

        {isLoading ? (
          <div className="flex justify-center p-8 text-emerald-400 text-xl font-medium animate-pulse">
            Loading Data from Strapi...
          </div>
        ) : staffList.length > 0 ? (
          <div className="flex flex-col gap-8">
            {staffList.map((member, index) => (
              <AcademicStaffProfileCard key={index} {...member} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-600 p-12 text-center text-slate-400">
            <p className="text-lg">No staff profiles found.</p>
          </div>
        )}
      </section>

      {/* --- Events & News Section --- */}
      <div className="mt-12">
        <EventsNewsSection 
          events={eventsList} 
          news={newsList} 
        />
      </div>

      {/* --- LIVE SCHEDULES SECTION --- */}
      <div className="mt-12">
        <Schedules />
      </div>

      {/* --- Dynamic Study Plans Section --- */}
      <section className="mt-12 bg-white py-12">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-10">
          <h2 className="mb-6 text-center text-3xl font-bold text-slate-900 sm:text-left">
            Study Plans (Connected to Strapi)
          </h2>
          <div className="space-y-8">
            <NewStudyPlanResources config={undergradConfig} />
            <NewStudyPlanResources config={postgradConfig} />
            <ResourcesComponent config={mockGenericReources} />
          </div>
        </div>
      </section>
      
    </div>
  );
}