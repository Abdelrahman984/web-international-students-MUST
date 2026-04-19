/**
 * Strapi CMS Response Types
 * Define interfaces for all Strapi single-type endpoints
 */

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleTypeResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: Record<string, any>;
}

/**
 * Block types for dynamic content rendering
 */
export type PageAccessRole = 'public' | 'visitor' | 'college-member';

export interface CmsMediaFile {
  id?: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  name?: string;
  mime?: string;
  ext?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface RichTextBlock {
  __component: 'shared.rich-text';
  body: string;
  anchor?: string;
}

export interface QuoteBlock {
  __component: 'shared.quote';
  title: string;
  body: string;
  anchor?: string;
}

export interface MediaBlock {
  __component: 'shared.media';
  file: CmsMediaFile | null;
  anchor?: string;
}

export interface SliderBlock {
  __component: 'shared.slider';
  files: CmsMediaFile[];
  anchor?: string;
}

export type ContentBlock = RichTextBlock | QuoteBlock | MediaBlock | SliderBlock;

export interface CmsPageSeo {
  [key: string]: unknown;
}

export interface CmsPage {
  id: number;
  title?: string;
  slug?: string;
  subtitle?: string;
  accessRole?: PageAccessRole;
  seo?: CmsPageSeo | null;
  blocks?: ContentBlock[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Homepage = CmsPage;

/**
 * Homepage single-type
 */
export interface Academics {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: ContentBlock[];
  departments?: {
    name: string;
    description: string;
    icon?: string;
  }[];
  image?: {
    data?: {
      id: number;
      attributes: {
        url: string;
        alt?: string;
      };
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Questionnaires single-type
 */
export interface Questionnaires {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: ContentBlock[];
  forms?: {
    name: string;
    url: string;
    description?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Resources single-type
 */
export interface Resources {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: ContentBlock[];
  categories?: {
    name: string;
    description?: string;
    icon?: string;
    resources?: {
      name: string;
      url: string;
      size?: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Announcements single-type
 */
export interface Announcements {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: ContentBlock[];
  announcements_items?: {
    title: string;
    excerpt?: string;
    content?: string;
    date: string;
    category?: string;
    urgent?: boolean;
    attachments?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          name: string;
        };
      }[];
    };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Contact Us single-type
 */
export interface ContactUs {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: ContentBlock[];
  email?: string;
  phone?: string;
  address?: string;
  office_hours?: {
    day: string;
    hours: string;
  }[];
  social_media?: {
    platform: string;
    url: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Error response
 */
export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: {
    errors?: Array<{
      path: string[];
      message: string;
      name: string;
    }>;
  };
}

export interface StrapiListItem {
  id: number;
  value: string;
}

export interface StrapiExperience {
  id: number;
  title: string;
  period: string;
  description: string;
}

export interface StrapiAcademicStaff {
  name: string;
  role: string;
  specialty?: string;
  email?: string;
  bio?: string;
  cvLabel?: string;
  qualifications?: StrapiListItem[];
  researchDirections?: StrapiListItem[];
  experience?: StrapiExperience[];
  avatar?: {
    data?: { attributes: { url: string } };
  };
  cvDocument?: {
    data?: { attributes: { url: string } };
  };
}