export interface MenuItem {
  label: string;
  translationKey?: string;
  externalUrl?: string;
  routerLink?: string;
  isDirectLink?: boolean;
  hasMegaMenu?: boolean;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'The University',
    translationKey: 'university',
    externalUrl: 'https://must.edu.eg/',
    hasMegaMenu: true,
    children: [
      {
        label: 'About MUST',
        translationKey: 'aboutMust',
        externalUrl: 'https://must.edu.eg/',
        children: [
          { label: 'Board of Trustees', translationKey: 'boardOfTrustees', externalUrl: 'https://must.edu.eg/about-must/board-of-trustees/' },
          { label: 'President', translationKey: 'president', externalUrl: 'https://must.edu.eg/about-must/president/' },
          { label: 'Vision & Mission', translationKey: 'visionMission', externalUrl: 'https://must.edu.eg/about-must/vision-mission/' },
          { label: 'MUST Values & Principles', translationKey: 'values', externalUrl: 'https://must.edu.eg/about-must/must-policies/' },
          { label: 'History', translationKey: 'history', externalUrl: 'https://must.edu.eg/history/' }
        ]
      },
      {
        label: 'Sectors',
        translationKey: 'sectors',
        externalUrl: 'https://must.edu.eg/',
        children: [
          {
            label: 'Environmental and Community Service Sector',
            translationKey: 'envSector',
            externalUrl: 'https://must.edu.eg/sectors/environmental-and-community-service-sector/',
            children: [
              { label: 'Innovation and Entrepreneurship Center', translationKey: 'innovationCenter', externalUrl: 'https://must.edu.eg/centers/innovation-and-entrepreneurship-center/' },
              { label: 'Arab Heritage Authentication Center', translationKey: 'heritageCenter', externalUrl: 'https://must.edu.eg/centers/test/' },
              { label: 'Equal Opportunities & Gender Equality Unit', translationKey: 'genderEqualityUnit', externalUrl: 'https://must.edu.eg/units/equal-opportunities-gender-equality-unit/' }
            ]
          },
          { label: 'Sustainability Sector', translationKey: 'sustainabilitySector', externalUrl: 'https://must.edu.eg/sustainability-office/' }
        ]
      },
      {
        label: 'Reports',
        translationKey: 'reports',
        externalUrl: 'https://must.edu.eg/reports/',
        children: [
          { label: 'Interdisciplinary Subjects', translationKey: 'interdisciplinaryReports', externalUrl: 'https://must.edu.eg/reports/interdisciplinary-science/' },
          { label: 'Financial Report', translationKey: 'financialReport', externalUrl: 'https://must.edu.eg/reports/financial-report/' }
        ]
      },
      {
        label: 'Policies',
        translationKey: 'policies',
        externalUrl: 'https://must.edu.eg/policies/',
        isDirectLink: true
      },
      {
        label: 'Univeristy Council Minutes',
        translationKey: 'councilMinutes',
        externalUrl: 'https://must.edu.eg/univeristy-council-minutes/',
        isDirectLink: true
      },
      {
        label: 'Quality Assurance and Accreditation Sector',
        translationKey: 'qaSector',
        externalUrl: 'https://must.edu.eg/sectors/quality-assurance-and-accreditation-sector/',
        isDirectLink: true
      },
      {
        label: 'Accreditation & Partnerships',
        translationKey: 'accreditation',
        externalUrl: 'https://must.edu.eg/?page_id=1660',
        isDirectLink: true
      },
      {
        label: 'Contact Us',
        translationKey: 'contactUs',
        externalUrl: 'https://must.edu.eg/contact/',
        isDirectLink: true
      },
      {
        label: 'Resources',
        translationKey: 'resourcesNav',
        externalUrl: 'https://must.edu.eg/',
        children: [
          { label: 'Smart E-Learning', translationKey: 'smartElearning', externalUrl: 'https://must.edu.eg/smart-e-learning/' },
          { label: 'MUSTER', translationKey: 'musterNav', externalUrl: 'https://must.edu.eg/muster/' },
          { label: 'Digital Archive & Research Repository (MDAR)', translationKey: 'mdarNav', externalUrl: 'http://dspace.must.edu.eg/' }
        ]
      }
    ]
  },
  {
    label: 'Academics',
    translationKey: 'academics',
    externalUrl: 'https://must.edu.eg/academics/',
    children: [
      { label: 'Academic Staff', translationKey: 'academicStaff', routerLink: '/academics' },
      { label: 'Schedules', translationKey: 'schedules', routerLink: '/schedules' },
      { label: 'Undergraduate Studies', translationKey: 'undergraduateStudies', routerLink: '/undergraduate' },
      { label: 'Post-Graduate Program', translationKey: 'postgraduateProgram', routerLink: '/postgraduate' },
      { label: 'Honor List', translationKey: 'honorList', routerLink: '/honor-list' },
      { label: 'Academic Calendar', translationKey: 'academicCalendarTitle', externalUrl: 'https://must.edu.eg/academic-calendar/' },
      { label: 'International Students Affairs Sector', translationKey: 'intlAffairsSector', externalUrl: 'https://must.edu.eg/sectors/international-students-affairs-sector/' }
    ]
  },
  {
    label: 'Admission',
    translationKey: 'admission',
    externalUrl: 'https://admission.must.edu.eg',
    isDirectLink: true
  },
  {
    label: 'MUST BUZZ',
    translationKey: 'buzz',
    externalUrl: 'https://must.edu.eg/',
    children: [
      { label: 'MUST Events', translationKey: 'mustEvents', routerLink: '/events' },
      { label: 'MUST News', translationKey: 'mustNews', routerLink: '/news' },
      { label: 'MUST Blogs', translationKey: 'mustBlogs', externalUrl: 'https://must.edu.eg/blog/' },
      { label: 'Announcements', translationKey: 'announcementsNav', externalUrl: 'https://must.edu.eg/anouncement/' }
    ]
  },
  {
    label: 'Centers',
    translationKey: 'centers',
    externalUrl: 'https://must.edu.eg/centers/',
    children: [
      { label: 'Centers', translationKey: 'centersList', externalUrl: 'https://must.edu.eg/centers/' },
      { label: 'Units', translationKey: 'units', externalUrl: 'https://must.edu.eg/units/' },
      { label: 'Research Center for Public Opinion and Societal Issues Monitoring', translationKey: 'researchCenter', externalUrl: 'https://must.edu.eg/sectors/research-center-for-public-opinion-and-societal-issues-monitoring/' }
    ]
  },
  {
    label: 'Life At MUST',
    translationKey: 'life',
    externalUrl: 'https://must.edu.eg/',
    children: [
      { label: 'MUST Life', translationKey: 'mustLife', externalUrl: 'https://must.edu.eg/must-life/' },
      { label: 'MUST Stars', translationKey: 'mustStars', externalUrl: 'https://must.edu.eg/stars/' },
      { label: 'MUST Clubs', translationKey: 'mustClubs', externalUrl: 'https://must.edu.eg/clubs/' },
      { label: 'Facilities', translationKey: 'facilities', externalUrl: 'https://must.edu.eg/facilities/' }
    ]
  },
  {
    label: 'SDGs',
    translationKey: 'sdgs',
    externalUrl: 'https://SDG.must.edu.eg/SDG',
    isDirectLink: true
  }
];