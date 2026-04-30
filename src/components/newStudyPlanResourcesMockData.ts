export type StudyTrackKey = "msc" | "phd" | "professional";
export type StudyTrackSpecialty = "CS" | "IS" | "AI";
export type UndergradSpecialtyKey = "cs" | "general" | "is" | "ai";
export type CurriculumKey = "old" | "new";

interface PdfResource {
  id: string;
  title: string;
  url: string;
}

interface ResearchTrackData {
  type: "research";
  label: string;
  resourcesBySpecialty: Record<StudyTrackSpecialty, PdfResource[]>;
}

interface ProfessionalTrackData {
  type: "professional";
  label: string;
  resources: PdfResource[];
}

export interface StudyPlanResourceConfig {
  mode: "degree-tracks";
  title: string;
  tracks: {
    msc: ResearchTrackData;
    phd: ResearchTrackData;
    professional: ProfessionalTrackData;
  };
}

interface UndergradSpecialtyData {
  label: string;
  resourcesByCurriculum: Record<CurriculumKey, PdfResource[]>;
}

interface UndergradStudyPlanResourceConfig {
  mode: "undergrad-specialties";
  title: string;
  specialties: Record<UndergradSpecialtyKey, UndergradSpecialtyData>;
}

export type StudyPlanResourceConfigUnion =
  | StudyPlanResourceConfig
  | UndergradStudyPlanResourceConfig;

export const undergradStudyPlanConfig: StudyPlanResourceConfigUnion = {
  mode: "undergrad-specialties",
  title: "Study Plans (Undergrad)",
  specialties: {
    cs: {
      label: "Computer Science",
      resourcesByCurriculum: {
        old: [
          {
            id: "ug-cs-old-1",
            title: "Old CS Program",
            url: "/drive_folder/Old%20CS%20Program.pdf",
          },
        ],
        new: [
          {
            id: "ug-cs-new-1",
            title: "NEW CS Program",
            url: "/drive_folder/NEW%20CS%20Program.pdf",
          },
        ],
      },
    },
    general: {
      label: "General",
      resourcesByCurriculum: {
        old: [],
        new: [],
      },
    },
    is: {
      label: "Information System",
      resourcesByCurriculum: {
        old: [
          {
            id: "ug-is-old-1",
            title: "Information System - Old Curriculum",
            url: "/accademics/study-plans/ug-is-old-level-1.pdf",
          },
        ],
        new: [
          {
            id: "ug-is-new-1",
            title: "Information System - New Curriculum",
            url: "/accademics/study-plans/ug-is-new-level-1.pdf",
          },
        ],
      },
    },
    ai: {
      label: "Artificial Intelligence",
      resourcesByCurriculum: {
        old: [
          {
            id: "ug-ai-old-1",
            title: "AI - Old Curriculum",
            url: "/accademics/study-plans/ug-ai-old-foundation.pdf",
          },
        ],
        new: [
          {
            id: "ug-ai-new-1",
            title: "AI - New Curriculum",
            url: "/accademics/study-plans/ug-ai-new-foundation.pdf",
          },
        ],
      },
    },
  },
};

export const postgradStudyPlanConfig: StudyPlanResourceConfigUnion = {
  mode: "degree-tracks",
  title: "Study Plans (Postgrad)",
  tracks: {
    msc: {
      type: "research",
      label: "M. SC",
      resourcesBySpecialty: {
        CS: [
          {
            id: "pg-msc-cs-1",
            title: "MSc Computer Science Coursework Structure",
            url: "/accademics/study-plans/pg-msc-cs-coursework.pdf",
          },
          {
            id: "pg-msc-cs-2",
            title: "MSc Computer Science Thesis Timeline",
            url: "/accademics/study-plans/pg-msc-cs-thesis-timeline.pdf",
          },
        ],
        IS: [
          {
            id: "pg-msc-is-1",
            title: "MSc IS Coursework Structure",
            url: "/accademics/study-plans/pg-msc-is-coursework.pdf",
          },
          {
            id: "pg-msc-is-2",
            title: "MSc Information System Thesis Timeline",
            url: "/accademics/study-plans/pg-msc-is-thesis-timeline.pdf",
          },
        ],
        AI: [
          {
            id: "pg-msc-ai-1",
            title: "MSc AI Coursework Structure",
            url: "/accademics/study-plans/pg-msc-ai-coursework.pdf",
          },
          {
            id: "pg-msc-ai-2",
            title: "MSc AI Thesis Timeline",
            url: "/accademics/study-plans/pg-msc-ai-thesis-timeline.pdf",
          },
        ],
      },
    },
    phd: {
      type: "research",
      label: "PH.D",
      resourcesBySpecialty: {
        CS: [
          {
            id: "pg-phd-cs-1",
            title: "PhD CS Milestones and Qualifier Plan",
            url: "/accademics/study-plans/pg-phd-cs-milestones.pdf",
          },
          {
            id: "pg-phd-cs-2",
            title: "PhD CS Publication Requirements",
            url: "/accademics/study-plans/pg-phd-cs-publications.pdf",
          },
        ],
        IS: [
          {
            id: "pg-phd-is-1",
            title: "PhD Information System Milestones and Qualifier Plan",
            url: "/accademics/study-plans/pg-phd-is-milestones.pdf",
          },
          {
            id: "pg-phd-is-2",
            title: "PhD Information System Publication Requirements",
            url: "/accademics/study-plans/pg-phd-is-publications.pdf",
          },
        ],
        AI: [
          {
            id: "pg-phd-ai-1",
            title: "PhD AI Milestones and Qualifier Plan",
            url: "/accademics/study-plans/pg-phd-ai-milestones.pdf",
          },
          {
            id: "pg-phd-ai-2",
            title: "PhD AI Publication Requirements",
            url: "/accademics/study-plans/pg-phd-ai-publications.pdf",
          },
        ],
      },
    },
    professional: {
      type: "professional",
      label: "Professional Degrees",
      resources: [
        {
          id: "pg-pro-1",
          title: "Executive Diploma in AI and ML",
          url: "/accademics/study-plans/pg-prof-ai-ml.pdf",
        },
        {
          id: "pg-pro-2",
          title: "Executive Diploma in Information Governance",
          url: "/accademics/study-plans/pg-prof-info-governance.pdf",
        },
      ],
    },
  },
};
