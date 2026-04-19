/**
 * Content Block Renderer
 * Renders various types of content blocks from Strapi CMS
 */

import { ContentBlock as ContentBlockType } from '../types/strapi';
import { getStrapiMediaUrl } from '../services/cmsApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentBlocksProps {
  blocks?: ContentBlockType[];
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => (
        <section key={idx} id={block.anchor || undefined} className="scroll-mt-28">
          <ContentBlock block={block} />
        </section>
      ))}
    </div>
  );
}

interface ContentBlockProps {
  block: ContentBlockType;
}

function ContentBlock({ block }: ContentBlockProps) {
  const component = block.__component;
  const safeContent = component === 'shared.rich-text' ? normalizeSharePointVideoLinks(sanitizeHtml(block.body)) : '';

  const isSharePointVideoUrl = (url: string) => url.startsWith('https://mustedueg.sharepoint.com/');

  const parseSharePointVideoUrl = (url: string): { href: string; title: string | null } => {
    const titleFromRaw = url.match(/\(([^()]+)\)\s*$/)?.[1]?.trim();
    const hrefWithoutRawSuffix = url
      .replace(/\([^()]+\)\s*$/, '')
      .replace(/%28.*%29\s*$/i, '');

    let title = titleFromRaw || null;

    if (!title) {
      try {
        const decoded = decodeURIComponent(url);
        title = decoded.match(/\(([^()]+)\)\s*$/)?.[1]?.trim() || null;
      } catch {
        title = null;
      }
    }

    return { href: hrefWithoutRawSuffix, title };
  };

  const renderHeading = (Tag: 'h1' | 'h2' | 'h3', className: string) => {
    return ({ children, ...props }: any) => {
      const text = getTextContent(children);
      const id = text ? slugify(text) : undefined;

      return <Tag id={id} className={className} {...props}>{children}</Tag>;
    };
  };

  const markdownComponents = {
    h1: renderHeading('h1', 'text-3xl md:text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white scroll-mt-28'),
    h2: renderHeading('h2', 'text-2xl md:text-3xl font-bold mt-7 mb-3 text-gray-900 dark:text-white scroll-mt-28'),
    h3: renderHeading('h3', 'text-xl md:text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white scroll-mt-28'),
    p: (props: any) => <p className="text-base md:text-lg leading-8 mb-4 text-gray-800 dark:text-gray-200" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-4 space-y-2 text-base md:text-lg text-gray-800 dark:text-gray-200" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-base md:text-lg text-gray-800 dark:text-gray-200" {...props} />,
    li: (props: any) => <li className="leading-7" {...props} />,
    a: ({ href, children, ...props }: any) => {
      const url = typeof href === 'string' ? href : '';

      if (url && isSharePointVideoUrl(url)) {
        const { href: cleanedHref, title } = parseSharePointVideoUrl(url);
        const displayTitle = title || 'Video';

        return (
          <a
            href={cleanedHref}
            target="_blank"
            rel="noreferrer"
            className="my-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 no-underline text-sky-700 hover:opacity-80 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300"
            {...props}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <rect x="3.5" y="5" width="12.5" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 12 8.5 10.5v3L11 12Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m16 10 4-2v8l-4-2" />
              </svg>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-semibold underline break-words text-gray-900 dark:text-gray-100">
                {displayTitle}
              </span>
            </span>

            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-gray-500 dark:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14 19 5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
              </svg>
            </span>
          </a>
        );
      }

      return <a href={href} className="text-green-700 dark:text-green-400 underline hover:opacity-80" {...props}>{children}</a>;
    },
    table: ({ children }: any) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
        <table className="min-w-full text-left text-sm md:text-base">{children}</table>
      </div>
    ),
    thead: (props: any) => <thead className="bg-gray-100 dark:bg-slate-800" {...props} />,
    tbody: (props: any) => <tbody className="bg-white dark:bg-slate-900" {...props} />,
    tr: (props: any) => <tr className="border-b border-gray-200 dark:border-slate-700" {...props} />,
    th: (props: any) => <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white" {...props} />,
    td: (props: any) => <td className="px-4 py-3 text-gray-800 dark:text-gray-200" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-green-500 pl-4 my-5 italic text-gray-700 dark:text-gray-300" {...props} />,
    pre: (props: any) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
    code: (props: any) => <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm" {...props} />,
  };

  switch (component) {
    case 'shared.rich-text':
      return (
        <div className="max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {safeContent}
          </ReactMarkdown>
        </div>
      );
    
    case 'shared.quote':
      return (
        <figure className="border-l-4 border-green-500 pl-4 my-4">
          {block.title && <figcaption className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">{block.title}</figcaption>}
          <blockquote className="italic text-gray-700 dark:text-gray-300">
            <p className="text-lg mb-2">{block.body}</p>
          </blockquote>
        </figure>
      );
    
    case 'shared.media': {
      const file = block.file;

      if (!file?.url) {
        return null;
      }

      const mediaUrl = getStrapiMediaUrl(file.url);
      const mediaAlt = file.alternativeText || file.name || 'Content media';

      if (file.mime?.startsWith('video/')) {
        return (
          <figure className="my-6">
            <video controls className="w-full max-h-[32rem] rounded-lg bg-black">
              <source src={mediaUrl} type={file.mime} />
              Your browser does not support the video tag.
            </video>
            {file.caption && (
              <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {file.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      if (file.mime?.startsWith('image/') || !file.mime) {
        return (
          <figure className="my-6">
            <img
              src={mediaUrl}
              alt={mediaAlt}
              className="w-full max-h-96 object-cover rounded-lg"
            />
            {file.caption && (
              <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {file.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      const isPdf = file.mime === 'application/pdf' || /\.pdf($|\?)/i.test(file.url);

      if (isPdf) {
        return (
          <div className="my-6 rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-green-700 dark:text-green-400 hover:opacity-80"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M6.75 2.25h7.5l5.25 5.25v13.5A1.5 1.5 0 0 1 18 22.5H6a1.5 1.5 0 0 1-1.5-1.5v-17A1.75 1.75 0 0 1 6.25 2.25h.5Zm7.5 1.5v4.5h4.5" />
                  <path d="M8.25 14.25h7.5v1.5h-7.5v-1.5Zm0 3h4.5v1.5h-4.5v-1.5Zm0-6h7.5v1.5h-7.5v-1.5Z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="font-semibold underline break-words">{mediaAlt}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{file.caption}</p>
              </div>
            </a>
    
          </div>
        );
      }

      return (
        <div className="my-6 rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="text-green-700 dark:text-green-400 underline hover:opacity-80"
          >
            Download {mediaAlt}
          </a>
          {file.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{file.caption}</p>
          )}
        </div>
      );
    }

    case 'shared.slider':
      return (
        <figure className="my-6 mx-auto max-w-6xl px-2">
          <div className="flex flex-wrap justify-center gap-4">
            {block.files.map((file, idx) => (
              <div key={idx} className="w-full max-w-md overflow-hidden rounded-lg shadow-md">
                <img
                  src={getStrapiMediaUrl(file.url)}
                  alt={file.alternativeText || file.name || `Slide ${idx + 1}`}
                  className="w-full h-48 object-cover"
                />
                {file.caption && (
                  <div className="p-3 bg-white dark:bg-slate-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {file.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </figure>
      );
    
    default:
      return null;
  }
}

/**
 * Basic HTML sanitization to prevent XSS
 * For production, consider using a library like DOMPurify
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*['"]/gi, 'data-event="');
  return sanitized;
}

function normalizeSharePointVideoLinks(content: string): string {
  return content.replace(/https:\/\/mustedueg\.sharepoint\.com\/[^\n\r]*?\(([^)]+)\)/gi, (rawUrl, title) => {
    const cleanedTitle = String(title || '').trim();

    if (!cleanedTitle) {
      return rawUrl;
    }

    const baseUrl = rawUrl.replace(/\(([^)]+)\)\s*$/, '');
    const encodedTitle = encodeURIComponent(cleanedTitle);

    return `${baseUrl}%28${encodedTitle}%29`;
  });
}

function getTextContent(node: any): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join(' ');
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as any).props?.children);
  }

  return '';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

