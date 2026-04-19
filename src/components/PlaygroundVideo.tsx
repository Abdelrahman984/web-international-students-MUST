import { useCallback, useEffect, useRef, useState } from 'react';

type PlaygroundVideoProps = {
  src: string;
  title: string;
  description: string;
  poster?: string;
  /** If provided, card renders as clickable placeholder and opens this URL instead of native video playback. */
  externalUrl?: string;
  /** Optional precomputed duration label (e.g. "5:12") for URL-based videos. */
  durationText?: string;
  /** MIME type for the `<source>` element (default video/mp4). */
  mimeType?: string;
};

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—:—';
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

export function PlaygroundVideo({
  src,
  title,
  description,
  poster,
  externalUrl,
  durationText,
  mimeType = 'video/mp4',
}: PlaygroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const isExternal = Boolean(externalUrl);

  const captureDuration = useCallback(() => {
    const el = videoRef.current;
    const d = el?.duration;
    if (el && Number.isFinite(d) && d > 0) {
      setDurationLabel(formatDuration(d));
    }
  }, []);

  useEffect(() => {
    setDurationLabel(null);
  }, [src]);

  return (
    <article className="mx-auto min-w-80 min-h-36 max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:shadow-slate-900/50">
      <div className="aspect-video w-full bg-black">
        {isExternal ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block h-full w-full overflow-hidden"
            aria-label={`Open video: ${title}`}
          >
            {poster ? (
              <img src={poster} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
            )}
            <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <PlayIcon className="h-8 w-8" />
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider">Play Video</span>
            </div>
          </a>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            aria-label={title}
            onLoadedMetadata={captureDuration}
            onDurationChange={captureDuration}
          >
            <source src={src} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className="border-t border-slate-100 p-5 sm:p-6 dark:border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="min-w-0 flex-1 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          {isExternal ? (
            <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">
              <ClockIcon className="h-4 w-4 shrink-0 opacity-80" />
              <span>{durationText || 'External video link'}</span>
            </div>
          ) : (
            <div
              className="flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400"
              title={durationLabel ? `Duration ${durationLabel}` : 'Loading duration'}
            >
              <ClockIcon className="h-4 w-4 shrink-0 opacity-80" />
              <span className={durationLabel ? '' : 'animate-pulse'}>{durationLabel ?? '…'}</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </article>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.4-6.86a1 1 0 0 0 0-1.7l-10.4-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}
