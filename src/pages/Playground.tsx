import { useEffect, useState } from 'react';
import AcademicStaffProfileCard, { AcademicStaffProfileCardProps } from '../components/AcademicStaffProfileCard';
import StaffAccordion from '../components/StaffAccordion';
import EventsNewsSection from '../components/EventsNewsCarousels';
import Schedules from './Accademics/homepage/Schedules'; // Ensure this path is correct for your file

import NewStudyPlanResources from '../components/NewStudyPlanResources';
import { postgradStudyPlanConfig, undergradStudyPlanConfig } from '../components/newStudyPlanResourcesMockData';
import ResourcesComponent from '../components/ResourcesComponent';
import { mockGenericReources } from '../components/genericResourcesMockData';
import { PlaygroundVideo } from '../components/PlaygroundVideo';
import { playgroundVideoItems, videoSrc } from '../data/playgroundVideos';
import {
  getAcademicStaffList,
  getEventsList,
  getManyFileLinks,
  getNewsList,
  getStudyPlansRow,
  getFileUrl,
  type EventCardItem,
  type NewsCardItem,
} from '../services/cmsApi';

export default function Playground() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>([]);
  const [eventsList, setEventsList] = useState<EventCardItem[]>([]);
  const [newsList, setNewsList] = useState<NewsCardItem[]>([]);
  
  // Initialize with mock data, then overwrite with live Supabase data
  const [undergradConfig, setUndergradConfig] = useState<typeof undergradStudyPlanConfig>(undergradStudyPlanConfig);
  const [postgradConfig, setPostgradConfig] = useState<typeof postgradStudyPlanConfig>(postgradStudyPlanConfig);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [staffRows, eventsRows, newsRows, studyPlanAttrs] = await Promise.all([
          getAcademicStaffList(),
          getEventsList(),
          getNewsList(),
          getStudyPlansRow(),
        ]);

        const formattedStaff: AcademicStaffProfileCardProps[] = staffRows.map((member) => {
          return {
            title: member.title,
            firstName: member.firstName,
            lastName: member.lastName,
            position: member.position,
            name: member.name,
            role: member.role,
            specialty: member.specialty || '',
            department: member.department || member.role || '',
            email: member.email || '',
            bio: member.bio || '',
            cvLabel: member.cvLabel || 'Download CV (PDF)',
            googleScholarLink: member.googleScholarLink,
            imageUrl: member.avatarUrl === '#' ? '/accademics/image-not-hero.png' : member.avatarUrl,
            cvUrl: member.cvUrl,
          };
        });

        setStaffList(formattedStaff);
        setEventsList(eventsRows);
        setNewsList(newsRows);

          setUndergradConfig({
            mode: 'undergrad-specialties',
            title: 'Study Plans (Undergrad)',
            specialties: {
              cs: {
                label: 'Computer Science',
                resourcesByCurriculum: {
                  old: studyPlanAttrs.Undergrad_CS_Old_Curriculum ? [{ id: 'ug-cs-old', title: 'CS - Old Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_CS_Old_Curriculum) }] : [],
                  new: studyPlanAttrs.Undergrad_CS_New_Curriculum ? [{ id: 'ug-cs-new', title: 'CS - New Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_CS_New_Curriculum) }] : [],
                },
              },
              is: {
                label: 'Information System',
                resourcesByCurriculum: {
                  old: studyPlanAttrs.Undergrad_IS_Old_Curriculum ? [{ id: 'ug-is-old', title: 'IS - Old Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_IS_Old_Curriculum) }] : [],
                  new: studyPlanAttrs.Undergrad_IS_New_Curriculum ? [{ id: 'ug-is-new', title: 'IS - New Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_IS_New_Curriculum) }] : [],
                },
              },
              ai: {
                label: 'Artificial Intelligence',
                resourcesByCurriculum: {
                  old: studyPlanAttrs.Undergrad_AI_Old_Curriculum ? [{ id: 'ug-ai-old', title: 'AI - Old Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_AI_Old_Curriculum) }] : [],
                  new: studyPlanAttrs.Undergrad_AI_New_Curriculum ? [{ id: 'ug-ai-new', title: 'AI - New Curriculum', url: getFileUrl(studyPlanAttrs.Undergrad_AI_New_Curriculum) }] : [],
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
                  CS: studyPlanAttrs.Postgrad_CS ? [{ id: 'pg-msc-cs', title: 'MSc Computer Science', url: getFileUrl(studyPlanAttrs.Postgrad_CS) }] : [],
                  IS: studyPlanAttrs.Postgrad_AI ? [{ id: 'pg-msc-is', title: 'MSc Artificial Intelligence', url: getFileUrl(studyPlanAttrs.Postgrad_AI) }] : [],
                },
              },
              phd: {
                type: 'research',
                label: 'PH.D',
                resourcesBySpecialty: {
                  CS: studyPlanAttrs.Postgrad_CS ? [{ id: 'pg-phd-cs', title: 'PhD Computer Science', url: getFileUrl(studyPlanAttrs.Postgrad_CS) }] : [],
                  IS: studyPlanAttrs.Postgrad_AI ? [{ id: 'pg-phd-is', title: 'PhD Artificial Intelligence', url: getFileUrl(studyPlanAttrs.Postgrad_AI) }] : [],
                },
              },
              professional: {
                type: 'professional',
                label: 'Professional Degrees',
                resources: getManyFileLinks(studyPlanAttrs.Professional_diplomas, 'prof'),
              },
            },
          });
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAllData();
  }, []);

  return (
    <div className="w-full bg-[#070d19] pb-16">
      
      {/* --- Academic Staff Section --- */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-12 sm:px-8 lg:px-10">
        <h1 className="mb-6 text-center text-3xl font-bold text-emerald-400 sm:text-left">UI Playground</h1>
        <p className="mb-8 text-center text-slate-300 sm:text-left">
          Live preview of the collections loaded from Supabase.
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

        {isLoading ? (
          <div className="flex justify-center p-8 text-emerald-400 text-xl font-medium animate-pulse">
            Loading data from Supabase...
          </div>
        ) : staffList.length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.entries(
              staffList.reduce((acc, member) => {
                const r = [member.role, member.title, member.name].filter(Boolean).join(' ').toLowerCase();
                let roleGroup = 'Academic Staff';
                
                if (r.includes('assistant lecturer')) {
                  roleGroup = 'Assistant Lecturers';
                } else if (r.includes('lecturer')) {
                  roleGroup = 'Lecturers';
                } else if (r.includes('asst') && r.includes('prof')) {
                  roleGroup = 'Assistant Professors';
                } else if (r.includes('prof')) {
                  roleGroup = 'Professors';
                } else if (r.includes('teaching assistant')) {
                  roleGroup = 'Teaching Assistants';
                } else if (r.includes('demonstrator')) {
                  roleGroup = 'Demonstrators';
                } else if (member.role) {
                  roleGroup = member.role;
                }

                if (!acc[roleGroup]) acc[roleGroup] = [];
                acc[roleGroup].push(member);
                return acc;
              }, {} as Record<string, AcademicStaffProfileCardProps[]>)
            ).map(([roleName, members], index) => (
              <StaffAccordion
                key={roleName}
                roleName={roleName}
                staffList={members}
                defaultOpen={index === 0}
              />
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
            Study Plans (Connected to Supabase)
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