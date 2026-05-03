import { useMemo, useState } from "react";
import {
  GraduationCap,
  BookText,
  Library,
  MonitorPlay, // For CS
  Cpu, // For AI
  Network, // For IS
  Briefcase, // For Professional
} from "lucide-react";
import type {
  CurriculumKey,
  StudyPlanResourceConfigUnion,
  StudyTrackKey,
  StudyTrackSpecialty,
  UndergradSpecialtyKey,
} from "./newStudyPlanResourcesMockData";
import { PdfResourceCard } from "./PdfResourceCard";
import { LinkResourceCard } from "./LinkResourceCard";

interface NewStudyPlanResourcesProps {
  config: StudyPlanResourceConfigUnion;
}

const trackOrder: StudyTrackKey[] = ["msc", "phd", "professional"];
const undergradSpecialtyOrder: UndergradSpecialtyKey[] = [
  "general",
  "cs",
  "ai",
  "is",
];
const curriculumOrder: CurriculumKey[] = ["old", "new"];
const studyTrackSpecialtyOrder: StudyTrackSpecialty[] = ["CS", "IS", "AI"];

const studyTrackSpecialtyLabels: Record<StudyTrackSpecialty, string> = {
  CS: "Computer Science",
  IS: "Information Systems",
  AI: "Artificial Intelligence",
};

function getTrackTitleLabel(
  trackKey: StudyTrackKey,
  fallbackLabel: string,
): string {
  if (trackKey === "msc") return "MSc.";
  if (trackKey === "phd") return "Ph.D";
  return fallbackLabel;
}

function getIconForSpecialty(specialtyKey: string | StudyTrackSpecialty) {
  const key = specialtyKey.toLowerCase();
  if (key === "cs") return MonitorPlay;
  if (key === "ai") return Cpu;
  if (key === "is") return Network;
  if (key === "general") return Library;
  return Library;
}

function getIconForTrack(trackKey: string) {
  if (trackKey === "professional") return Briefcase;
  return GraduationCap;
}

function isSharePointVideoLink(url: string): boolean {
  return url.startsWith("https://mustedueg.sharepoint.com/");
}

function parseSharePointVideoLink(url: string): {
  href: string;
  title: string | null;
} {
  const titleMatch = url.match(/\(([^()]+)\)\s*$/);
  let title = titleMatch?.[1]?.trim() || null;
  const href = url.replace(/\([^()]+\)\s*$/, "").replace(/%28.*%29\s*$/i, "");

  if (!title) {
    try {
      const decoded = decodeURIComponent(url);
      title = decoded.match(/\(([^()]+)\)\s*$/)?.[1]?.trim() || null;
    } catch {
      title = null;
    }
  }

  return { href, title };
}

export default function NewStudyPlanResources({
  config,
}: NewStudyPlanResourcesProps) {
  const [activeTrack, setActiveTrack] = useState<StudyTrackKey | null>(null);
  const [activeSpecialty, setActiveSpecialty] =
    useState<StudyTrackSpecialty | null>(null);
  const [activeUndergradSpecialty, setActiveUndergradSpecialty] =
    useState<UndergradSpecialtyKey | null>(null);
  const [activeCurriculum, setActiveCurriculum] =
    useState<CurriculumKey | null>(null);

  const currentTrack = useMemo(() => {
    if (config.mode !== "degree-tracks" || !activeTrack) return null;
    return config.tracks[activeTrack];
  }, [config, activeTrack]);

  const resources = useMemo(() => {
    if (config.mode === "undergrad-specialties") {
      if (!activeUndergradSpecialty || !activeCurriculum) return [];
      return config.specialties[activeUndergradSpecialty].resourcesByCurriculum[
        activeCurriculum
      ];
    }
    if (!currentTrack) return [];
    if (
      currentTrack.type === "research" &&
      activeSpecialty &&
      activeCurriculum
    ) {
      return currentTrack.resourcesBySpecialty[activeSpecialty][
        activeCurriculum
      ];
    }
    if (currentTrack.type === "research") return [];
    return currentTrack.resources;
  }, [
    config,
    currentTrack,
    activeSpecialty,
    activeUndergradSpecialty,
    activeCurriculum,
  ]);

  const undergradSpecialtyLabel =
    config.mode === "undergrad-specialties" && activeUndergradSpecialty
      ? config.specialties[activeUndergradSpecialty].label
      : null;

  const curriculumLabel = activeCurriculum
    ? activeCurriculum === "old"
      ? "Old Curriculum"
      : "New Curriculum"
    : null;

  const currentTitle = useMemo(() => {
    if (config.mode === "undergrad-specialties") {
      if (undergradSpecialtyLabel && curriculumLabel)
        return `Study Plans (${undergradSpecialtyLabel} ${curriculumLabel})`;
      if (undergradSpecialtyLabel)
        return `Study Plans (${undergradSpecialtyLabel})`;
      return config.title;
    }
    if (activeTrack) {
      const parentLabel = getTrackTitleLabel(
        activeTrack,
        config.tracks[activeTrack].label,
      );
      if (activeSpecialty && curriculumLabel)
        return `Study Plans (${parentLabel} ${studyTrackSpecialtyLabels[activeSpecialty]} ${curriculumLabel})`;
      if (activeSpecialty)
        return `Study Plans (${parentLabel} ${studyTrackSpecialtyLabels[activeSpecialty]})`;
      return `Study Plans (${parentLabel})`;
    }
    return config.title;
  }, [
    config,
    activeTrack,
    activeSpecialty,
    undergradSpecialtyLabel,
    curriculumLabel,
  ]);

  const canGoBack =
    config.mode === "undergrad-specialties"
      ? Boolean(activeUndergradSpecialty || activeCurriculum)
      : Boolean(activeTrack || activeSpecialty || activeCurriculum);

  const handleGoBack = () => {
    if (activeCurriculum) {
      setActiveCurriculum(null);
      return;
    }
    if (activeSpecialty) {
      setActiveSpecialty(null);
      return;
    }
    setActiveTrack(null);
    setActiveUndergradSpecialty(null);
    setActiveCurriculum(null);
  };

  const tileButtonBase =
    "group flex flex-col items-center justify-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20 w-full sm:w-[260px]";
  const tileButtonActive =
    "ring-2 ring-emerald-500 bg-emerald-50/30 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800";

  const backButtonClass =
    "inline-flex items-center gap-2 rounded-full bg-[#002147] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#003366] hover:shadow-lg active:scale-95 dark:bg-blue-900 dark:hover:bg-blue-800";

  const TileIcon = ({
    Icon,
    isActive,
  }: {
    Icon: React.ElementType;
    isActive?: boolean;
  }) => (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50"}`}
    >
      <Icon
        className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
        strokeWidth={1.5}
      />
    </div>
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8 border-b border-slate-100 pb-6 dark:border-slate-800">
        <div className="flex justify-start min-w-[100px]">
          {canGoBack && (
            <button
              type="button"
              onClick={handleGoBack}
              className={backButtonClass}
            >
              Go Back
            </button>
          )}
        </div>
        <h3 className="text-center text-xl font-bold text-slate-800 md:text-2xl dark:text-slate-100 truncate">
          {currentTitle}
        </h3>
        <div className="min-w-[100px]"></div>
      </div>

      {config.mode === "degree-tracks" && (
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {!activeTrack &&
            trackOrder.map((trackKey) => {
              const track = config.tracks[trackKey];
              const Icon = getIconForTrack(trackKey);

              return (
                <button
                  key={trackKey}
                  type="button"
                  onClick={() => {
                    setActiveTrack(trackKey);
                    setActiveSpecialty(null);
                    setActiveCurriculum(null);
                  }}
                  className={tileButtonBase}
                >
                  <TileIcon Icon={Icon} />
                  <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                    {track.label}
                  </p>
                </button>
              );
            })}

          {activeTrack &&
            currentTrack?.type === "research" &&
            !activeSpecialty &&
            studyTrackSpecialtyOrder.map((specialty) => {
              const isActive = activeSpecialty === specialty;
              const specialtyLabel = studyTrackSpecialtyLabels[specialty];
              const Icon = getIconForSpecialty(specialty);

              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    setActiveSpecialty(specialty);
                    setActiveCurriculum(null);
                  }}
                  aria-pressed={isActive}
                  className={`${tileButtonBase} ${isActive ? tileButtonActive : ""}`}
                >
                  <TileIcon Icon={Icon} isActive={isActive} />
                  <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                    {specialtyLabel}
                  </p>
                </button>
              );
            })}

          {activeTrack &&
            currentTrack?.type === "research" &&
            activeSpecialty &&
            !activeCurriculum && (
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {curriculumOrder.map((curriculum) => {
                  const isActive = activeCurriculum === curriculum;
                  const label =
                    curriculum === "old" ? "Old Curriculum" : "New Curriculum";
                  return (
                    <button
                      key={curriculum}
                      type="button"
                      onClick={() => setActiveCurriculum(curriculum)}
                      aria-pressed={isActive}
                      className={`${tileButtonBase} ${isActive ? tileButtonActive : ""}`}
                    >
                      <TileIcon Icon={BookText} isActive={isActive} />
                      <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {config.mode === "undergrad-specialties" && (
        <div className="mt-10 flex flex-col items-center gap-8">
          {!activeUndergradSpecialty && (
            <>
              {/* First row: General */}
              <div className="flex justify-center w-full">
                {undergradSpecialtyOrder
                  .filter((k) => k === "general")
                  .map((specialtyKey) => {
                    const specialty = config.specialties[specialtyKey];
                    const Icon = getIconForSpecialty(specialtyKey);

                    return (
                      <button
                        key={specialtyKey}
                        type="button"
                        onClick={() => {
                          setActiveUndergradSpecialty(specialtyKey);
                          setActiveCurriculum(null);
                        }}
                        className={tileButtonBase}
                      >
                        <TileIcon Icon={Icon} />
                        <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {specialty.label}
                        </p>
                      </button>
                    );
                  })}
              </div>

              {/* Second row: CS, AI, IS in order */}
              <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
                {undergradSpecialtyOrder
                  .filter((k) => k !== "general")
                  .map((specialtyKey) => {
                    const specialty = config.specialties[specialtyKey];
                    const Icon = getIconForSpecialty(specialtyKey);

                    return (
                      <button
                        key={specialtyKey}
                        type="button"
                        onClick={() => {
                          setActiveUndergradSpecialty(specialtyKey);
                          setActiveCurriculum(null);
                        }}
                        className={tileButtonBase}
                      >
                        <TileIcon Icon={Icon} />
                        <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {specialty.label}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </>
          )}

          {activeUndergradSpecialty && !activeCurriculum && (
            <div className="flex flex-wrap justify-center gap-6 w-full">
              {curriculumOrder.map((curriculum) => {
                const isActive = activeCurriculum === curriculum;
                const label =
                  curriculum === "old" ? "Old Curriculum" : "New Curriculum";

                return (
                  <button
                    key={curriculum}
                    type="button"
                    onClick={() => setActiveCurriculum(curriculum)}
                    aria-pressed={isActive}
                    className={`${tileButtonBase} ${isActive ? tileButtonActive : ""}`}
                  >
                    <TileIcon Icon={BookText} isActive={isActive} />
                    <p className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                      {label}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {resources.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {resources.map((resource) => {
            if (isSharePointVideoLink(resource.url)) {
              const { href, title } = parseSharePointVideoLink(resource.url);
              return (
                <LinkResourceCard
                  key={resource.id}
                  href={href}
                  title={title || "Video"}
                  className="w-full sm:w-[400px]"
                />
              );
            }
            return (
              <PdfResourceCard
                key={resource.id}
                title={resource.title}
                url={resource.url}
                className="w-full sm:w-[400px]"
              />
            );
          })}
        </div>
      )}

      {canGoBack && (
        <div className="mt-12 flex justify-center border-t border-slate-100 pt-8 dark:border-slate-800">
          <button
            type="button"
            onClick={handleGoBack}
            className={backButtonClass}
          >
            Go Back
          </button>
        </div>
      )}
    </section>
  );
}
