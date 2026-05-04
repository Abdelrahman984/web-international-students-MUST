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
    label: "Home",
    routerLink: "/",
  },
  {
    label: "Academics",
    routerLink: "/academics",
    children: [
      {
        label: "Academic Staff",
        routerLink: "/academics",
      },
      {
        label: "Educational Programs",
        routerLink: "/educational-programs",
      },
      {
        label: "Academic Calendar",
        routerLink: "/calendar",
      },
      {
        label: "E-Learning",
        routerLink: "/e-learning",
      },
      {
        label: "Honor List",
        routerLink: "/honor-list",
      },
      {
        label: "Admission",
        routerLink: "/admission",
      },
    ],
  },
  {
    label: "Advising",
    routerLink: "/advising",
    children: [
      {
        label: "Advising Resources",
        routerLink: "/advising?tab=resources",
      },
      {
        label: "Announcement",
        routerLink: "/advising?tab=announcements",
      },
      {
        label: "Students Data",
        routerLink: "/advising?tab=students-data",
      },
      {
        label: "Statistical Reports",
        routerLink: "/advising?tab=statistical-reports",
      },
    ],
  },
  {
    label: "Activities",
    routerLink: "/activities",
    children: [
      {
        label: "Cultural",
        routerLink: "/cultural",
      },
      {
        label: "Sports",
        routerLink: "/sports",
      },
      {
        label: "Art",
        routerLink: "/art",
      },
      {
        label: "Student Clubs",
        routerLink: "/student-clubs",
      },
    ],
  },
  {
    label: "Facilities",
    routerLink: "/facilities",
    children: [
      {
        label: "MUST Facilities",
        routerLink: "/facilities?tab=mustFacilities",
      },
      {
        label: "International Handbook",
        routerLink: "/facilities?tab=internationalHandbook",
      },
    ],
  },
  {
    label: "News",
    routerLink: "/news",
  },
  {
    label: "Events",
    routerLink: "/events",
  },
  {
    label: "Links",
    routerLink: "/links",
  },
  {
    label: "Contact Us",
    routerLink: "/contact-us",
    children: [
      {
        label: "Contact Sector Head",
        routerLink: "/contact-us?tab=support",
      },
      {
        label: "Send Suggestion or Complaint",
        translationKey: "send_suggestion",
        routerLink: "/contact-us?tab=admissions",
      },
    ],
  },
];
