export interface GenericResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface GenericResourcesConfig {
  title: string;
  description?: string;
  resources: GenericResourceItem[];
}

export const mockGenericReources: GenericResourcesConfig = {
  title: 'Generic Resources',
  description: 'Reusable mock JSON-style object for generic downloadable resources.',
  resources: [
    {
      id: 'resource-1',
      title: 'Academic Calendar 2026',
      url: '/accademics/resources/academic-calendar-2026.pdf',
      description: 'Download PDF resource',
    },
    {
      id: 'resource-2',
      title: 'Student Handbook',
      url: '/accademics/resources/student-handbook.pdf',
      description: 'Download PDF resource',
    },
    {
      id: 'resource-3',
      title: 'Examination Regulations',
      url: '/accademics/resources/examination-regulations.pdf',
      description: 'Download PDF resource',
    },
    {
      id: 'resource-4',
      title: 'Graduation Requirements Guide',
      url: '/accademics/resources/graduation-requirements.pdf',
      description: 'Download PDF resource',
    },
  ],
};
