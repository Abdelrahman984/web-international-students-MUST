import { useEffect, useState } from "react";
import AcademicStaffProfileCard, {
  AcademicStaffProfileCardProps,
} from "../components/AcademicStaffProfileCard";
import StaffAccordion from "../components/StaffAccordion";
import EventsNewsSection from "../components/EventsNewsCarousels";
import Schedules from "./Accademics/homepage/Schedules";

import NewStudyPlanResources from "../components/NewStudyPlanResources";
import {
  postgradStudyPlanConfig,
  undergradStudyPlanConfig,
} from "../components/newStudyPlanResourcesMockData";
import ResourcesComponent from "../components/ResourcesComponent";
import { mockGenericReources } from "../components/genericResourcesMockData";
import { PlaygroundVideo } from "../components/PlaygroundVideo";
import { playgroundVideoItems, videoSrc } from "../data/playgroundVideos";
import { groupAcademicStaffByTitle } from "../utils/groupAcademicStaffByTitle";
import {
  getAcademicStaffList,
  getEventsList,
  getManyFileLinks,
  getNewsList,
  getStudyPlansRow,
  getFileUrl,
  type EventCardItem,
  type NewsCardItem,
} from "../services/cmsApi";

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
        const [staffRows, eventsRows, newsRows, studyPlanAttrs] =
          await Promise.all([
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
            specialty: member.specialty || "",
            department: member.department || member.role || "",
            email: member.email || "",
            bio: member.bio || "",
            cvLabel: member.cvLabel || "Download CV (PDF)",
            googleScholarLink: member.googleScholarLink,
            imageUrl:
              member.avatarUrl === "#"
                ? "/accademics/image-not-hero.png"
                : member.avatarUrl,
            cvUrl: member.cvUrl,
          };
        });

        setStaffList(formattedStaff);
        setEventsList(eventsRows);
        setNewsList(newsRows);

        setUndergradConfig({
          mode: "undergrad-specialties",
          title: "Study Plans (Undergrad)",
          specialties: {
            cs: {
              label: "Computer Science",
              resourcesByCurriculum: {
                old: studyPlanAttrs.Undergrad_CS_Old_Curriculum
                  ? [
                      {
                        id: "ug-cs-old",
                        title: "CS - Old Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_CS_Old_Curriculum),
                      },
                    ]
                  : [],
                new: studyPlanAttrs.Undergrad_CS_New_Curriculum
                  ? [
                      {
                        id: "ug-cs-new",
                        title: "CS - New Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_CS_New_Curriculum),
                      },
                    ]
                  : [],
              },
            },
            is: {
              label: "Information System",
              resourcesByCurriculum: {
                old: studyPlanAttrs.Undergrad_IS_Old_Curriculum
                  ? [
                      {
                        id: "ug-is-old",
                        title: "IS - Old Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_IS_Old_Curriculum),
                      },
                    ]
                  : [],
                new: studyPlanAttrs.Undergrad_IS_New_Curriculum
                  ? [
                      {
                        id: "ug-is-new",
                        title: "IS - New Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_IS_New_Curriculum),
                      },
                    ]
                  : [],
              },
            },
            ai: {
              label: "Artificial Intelligence",
              resourcesByCurriculum: {
                old: studyPlanAttrs.Undergrad_AI_Old_Curriculum
                  ? [
                      {
                        id: "ug-ai-old",
                        title: "AI - Old Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_AI_Old_Curriculum),
                      },
                    ]
                  : [],
                new: studyPlanAttrs.Undergrad_AI_New_Curriculum
                  ? [
                      {
                        id: "ug-ai-new",
                        title: "AI - New Curriculum",
                        url: getFileUrl(studyPlanAttrs.Undergrad_AI_New_Curriculum),
                      },
                    ]
                  : [],
              },
            },
          },
        });

        setPostgradConfig({
          mode: "degree-tracks",
          title: "Study Plans (Postgrad)",
          tracks: {
            msc: {
              type: "research",
              label: "M. SC",
              resourcesBySpecialty: {
                CS: studyPlanAttrs.Postgrad_CS
                  ? [
                      {
                        id: "pg-msc-cs",
                        title: "MSc Computer Science",
                        url: getFileUrl(studyPlanAttrs.Postgrad_CS),
                      },
                    ]
                  : [],
                IS: studyPlanAttrs.Postgrad_AI
                  ? [
                      {
                        id: "pg-msc-is",
                        title: "MSc Artificial Intelligence",
                        url: getFileUrl(studyPlanAttrs.Postgrad_AI),
                      },
                    ]
                  : [],
              },
            },
            phd: {
              type: "research",
              label: "PH.D",
              resourcesBySpecialty: {
                CS: studyPlanAttrs.Postgrad_CS
                  ? [
                      {
                        id: "pg-phd-cs",
                        title: "PhD Computer Science",
                        url: getFileUrl(studyPlanAttrs.Postgrad_CS),
                      },
                    ]
                  : [],
                IS: studyPlanAttrs.Postgrad_AI
                  ? [
                      {
                        id: "pg-phd-is",
                        title: "PhD Artificial Intelligence",
                        url: getFileUrl(studyPlanAttrs.Postgrad_AI),
                      },
                    ]
                  : [],
              },
            },
            professional: {
              type: "professional",
              label: "Professional Degrees",
              resources: getManyFileLinks(
                studyPlanAttrs.Professional_diplomas,
                "prof",
              ),
            },
          },
        });
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAllData();
  }, []);

  return (
    <div className="w-full bg-slate-50/50 pb-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">
        <div className="mb-16 text-center">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            UI Playground
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Live preview of all components and collections loaded directly from Supabase.
          </p>
        </div>

        {/* --- Help Videos Section --- */}
        <section className="mb-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-slate-100">Help Videos</h2>
          <div className="space-y-10">
            {playgroundVideoItems.map((item) => (
              <PlaygroundVideo
                key={item.fileName}
                src={videoSrc(item.fileName)}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        {/* --- Academic Staff Section --- */}
        <section className="mb-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Staff Profiles</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="mt-4 animate-pulse font-medium text-emerald-600 dark:text-emerald-400">
                Loading staff data...
              </p>
            </div>
          ) : staffList.length > 0 ? (
            <div className="flex flex-col gap-6">
              {groupAcademicStaffByTitle(staffList).map(([roleName, members], index) => (
                <StaffAccordion
                  key={roleName}
                  roleName={roleName}
                  staffList={members}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <p className="text-lg">No staff profiles found.</p>
            </div>
          )}
        </section>

        {/* --- Events & News Section --- */}
        <section className="mb-16">
          <EventsNewsSection events={eventsList} news={newsList} />
        </section>

        {/* --- Schedules Section --- */}
        <section className="mb-16">
          <Schedules />
        </section>

        {/* --- Dynamic Study Plans Section --- */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-slate-100 text-center md:text-left">
            Study Plans (Connected to Supabase)
          </h2>
          <div className="space-y-8">
            <NewStudyPlanResources config={undergradConfig} />
            <NewStudyPlanResources config={postgradConfig} />
            <ResourcesComponent config={mockGenericReources} />
          </div>
        </section>
      </div>
    </div>
  );
}
