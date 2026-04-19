import { useMemo, useState } from 'react';
import type {
  CurriculumKey,
  StudyPlanResourceConfigUnion,
  StudyTrackKey,
  StudyTrackSpecialty,
  UndergradSpecialtyKey,
} from './newStudyPlanResourcesMockData';
import { PdfResourceCard } from './PdfResourceCard';
import { LinkResourceCard } from './LinkResourceCard';

interface NewStudyPlanResourcesProps {
  config: StudyPlanResourceConfigUnion;
}

const trackOrder: StudyTrackKey[] = ['msc', 'phd', 'professional'];
const undergradSpecialtyOrder: UndergradSpecialtyKey[] = ['cs', 'is', 'ai'];
const curriculumOrder: CurriculumKey[] = ['old', 'new'];

const studyTrackSpecialtyLabels: Record<StudyTrackSpecialty, string> = {
  CS: 'Computer Science',
  IS: 'Information Systems',
};

function getTrackTitleLabel(trackKey: StudyTrackKey, fallbackLabel: string): string {
  if (trackKey === 'msc') {
    return 'MSc.';
  }

  if (trackKey === 'phd') {
    return 'Ph.D';
  }

  return fallbackLabel;
}

function isSharePointVideoLink(url: string): boolean {
  return url.startsWith('https://mustedueg.sharepoint.com/');
}

function parseSharePointVideoLink(url: string): { href: string; title: string | null } {
  const titleMatch = url.match(/\(([^()]+)\)\s*$/);
  let title = titleMatch?.[1]?.trim() || null;
  const href = url
    .replace(/\([^()]+\)\s*$/, '')
    .replace(/%28.*%29\s*$/i, '');

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

export default function NewStudyPlanResources({ config }: NewStudyPlanResourcesProps) {
  const [activeTrack, setActiveTrack] = useState<StudyTrackKey | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState<StudyTrackSpecialty | null>(null);
  const [activeUndergradSpecialty, setActiveUndergradSpecialty] = useState<UndergradSpecialtyKey | null>(null);
  const [activeCurriculum, setActiveCurriculum] = useState<CurriculumKey | null>(null);

  const currentTrack = useMemo(() => {
    if (config.mode !== 'degree-tracks' || !activeTrack) {
      return null;
    }

    return config.tracks[activeTrack];
  }, [config, activeTrack]);

  const resources = useMemo(() => {
    if (config.mode === 'undergrad-specialties') {
      if (!activeUndergradSpecialty || !activeCurriculum) {
        return [];
      }

      return config.specialties[activeUndergradSpecialty].resourcesByCurriculum[activeCurriculum];
    }

    if (!currentTrack) {
      return [];
    }

    if (currentTrack.type === 'research' && activeSpecialty) {
      return currentTrack.resourcesBySpecialty[activeSpecialty];
    }

    if (currentTrack.type === 'research') {
      return [];
    }

    return currentTrack.resources;
  }, [config, currentTrack, activeSpecialty, activeUndergradSpecialty, activeCurriculum]);

  const undergradSpecialtyLabel =
    config.mode === 'undergrad-specialties' && activeUndergradSpecialty
      ? config.specialties[activeUndergradSpecialty].label
      : null;

  const curriculumLabel = activeCurriculum
    ? activeCurriculum === 'old'
      ? 'Old Curriculum'
      : 'New Curriculum'
    : null;

  const currentTitle = useMemo(() => {
    if (config.mode === 'undergrad-specialties') {
      if (undergradSpecialtyLabel && curriculumLabel) {
        return `Study Plans (${undergradSpecialtyLabel} ${curriculumLabel})`;
      }

      if (undergradSpecialtyLabel) {
        return `Study Plans (${undergradSpecialtyLabel})`;
      }

      return config.title;
    }

    if (activeTrack) {
      const parentLabel = getTrackTitleLabel(activeTrack, config.tracks[activeTrack].label);

      if (activeSpecialty) {
        return `Study Plans (${parentLabel} ${studyTrackSpecialtyLabels[activeSpecialty]})`;
      }

      return `Study Plans (${parentLabel})`;
    }

    return config.title;
  }, [config, activeTrack, activeSpecialty, undergradSpecialtyLabel, curriculumLabel]);

  const canGoBack =
    config.mode === 'undergrad-specialties'
      ? Boolean(activeUndergradSpecialty || activeCurriculum)
      : Boolean(activeTrack || activeSpecialty);

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
  };

  const tileButtonBase = 'group flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-10 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:bg-slate-800 w-full sm:w-[320px]';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
        <div className="flex justify-start">
          {canGoBack && (
            <button
              type="button"
              onClick={handleGoBack}
              className="shrink-0 rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Go Back
            </button>
          )}
        </div>
        <h3 className="text-center text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">
          {currentTitle}
        </h3>
        <div></div>
      </div>

      {config.mode === 'degree-tracks' && (
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {!activeTrack &&
            trackOrder.map((trackKey) => {
              const track = config.tracks[trackKey];

              return (
                <button
                  key={trackKey}
                  type="button"
                  onClick={() => {
                    setActiveTrack(trackKey);
                    setActiveSpecialty(null);
                  }}
                  className={tileButtonBase}
                >
                  <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                  <p className="mt-2 text-xl font-bold text-[#0A2540] transition-colors duration-300 group-hover:text-[#00A152] dark:text-white dark:group-hover:text-[#00c968]">{track.label}</p>
                </button>
              );
            })}

          {activeTrack && currentTrack?.type === 'research' && !activeSpecialty &&
            (['CS', 'IS'] as StudyTrackSpecialty[]).map((specialty) => {
              const isActive = activeSpecialty === specialty;
              const specialtyLabel = studyTrackSpecialtyLabels[specialty];

              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => setActiveSpecialty(specialty)}
                  aria-pressed={isActive}
                  className={`${tileButtonBase} ${
                    isActive
                      ? 'ring-2 ring-[#00A152] bg-slate-50 dark:bg-slate-800/80'
                      : ''
                  }`}
                >
                  <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                  <p className="mt-2 text-xl font-bold text-[#0A2540] transition-colors duration-300 group-hover:text-[#00A152] dark:text-white dark:group-hover:text-[#00c968]">{specialtyLabel}</p>
                </button>
              );
            })}
        </div>
      )}

      {config.mode === 'undergrad-specialties' && (
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {!activeUndergradSpecialty &&
            undergradSpecialtyOrder.map((specialtyKey) => {
              const specialty = config.specialties[specialtyKey];

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
                  <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                  <p className="mt-2 text-xl font-bold text-[#0A2540] transition-colors duration-300 group-hover:text-[#00A152] dark:text-white dark:group-hover:text-[#00c968]">{specialty.label}</p>
                </button>
              );
            })}

          {activeUndergradSpecialty && !activeCurriculum &&
            curriculumOrder.map((curriculum) => {
              const isActive = activeCurriculum === curriculum;
              const label = curriculum === 'old' ? 'Old Curriculum' : 'New Curriculum';

              return (
                <button
                  key={curriculum}
                  type="button"
                  onClick={() => setActiveCurriculum(curriculum)}
                  aria-pressed={isActive}
                  className={`${tileButtonBase} ${
                    isActive
                      ? 'ring-2 ring-[#00A152] bg-slate-50 dark:bg-slate-800/80'
                      : ''
                  }`}
                >
                  <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                  <p className="mt-2 text-xl font-bold text-[#0A2540] transition-colors duration-300 group-hover:text-[#00A152] dark:text-white dark:group-hover:text-[#00c968]">{label}</p>
                </button>
              );
            })}
        </div>
      )}

      {resources.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {resources.map((resource) => {
            if (isSharePointVideoLink(resource.url)) {
              const { href, title } = parseSharePointVideoLink(resource.url);

              return (
                <LinkResourceCard
                  key={resource.id}
                  href={href}
                  title={title || 'Video'}
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
    </section>
  );
}


