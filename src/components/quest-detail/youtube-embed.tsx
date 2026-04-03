'use client';

import { cn } from '@/utils/cn';

type YouTubeEmbedProps = {
  url: string;
  className?: string;
};

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
function extractYouTubeVideoId(url: string): string | null {
  if (!url) {
    return null;
  }

  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /youtube\.com\/watch\?v=([^&\s]+)/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([^?\s]+)/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^?\s]+)/,
    // youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^?\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export const YouTubeEmbed = ({ url, className }: YouTubeEmbedProps) => {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full overflow-hidden rounded-xl pt-[56.25%]">
        <iframe
          className="absolute left-0 top-0 size-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};
