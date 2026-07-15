"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

interface AdMedia {
  type: "image" | "video";
  data: string;
}

interface AdBannerProps {
  media: AdMedia[];
  tickerText: string;
}

const IDLE_TIMEOUT = 10000; // 10 seconds before auto-play resumes

export function AdBanner({ media, tickerText }: AdBannerProps) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractedRef = useRef(false);
  const hasMedia = media.length > 0;
  const hasTicker = tickerText.trim().length > 0;
  const currentItem = media[current];

  // Stop current video
  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Move to a specific slide
  const goTo = useCallback(
    (idx: number) => {
      stopVideo();
      userInteractedRef.current = true;
      setCurrent(idx);
    },
    [stopVideo]
  );

  const goNext = useCallback(() => {
    stopVideo();
    userInteractedRef.current = true;
    setCurrent((c) => (c + 1) % media.length);
  }, [stopVideo, media.length]);

  const goPrev = useCallback(() => {
    stopVideo();
    userInteractedRef.current = true;
    setCurrent((c) => (c === 0 ? media.length - 1 : c - 1));
  }, [stopVideo, media.length]);

  const toggleMute = () => setMuted((m) => !m);

  // Auto-play timer
  useEffect(() => {
    if (!hasMedia || media.length <= 1) return;

    // Clear any existing timer
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    // If user just interacted, wait IDLE_TIMEOUT before resuming auto-play
    if (userInteractedRef.current) {
      autoTimerRef.current = setTimeout(() => {
        userInteractedRef.current = false;
        stopVideo();
        setCurrent((prev) => (prev + 1) % media.length);
      }, IDLE_TIMEOUT);
      return () => {
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      };
    }

    // For videos: play once, then advance
    if (currentItem?.type === "video") {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        const onEnded = () => {
          stopVideo();
          setCurrent((prev) => (prev + 1) % media.length);
        };
        video.addEventListener("ended", onEnded);
        return () => {
          video.removeEventListener("ended", onEnded);
          video.pause();
        };
      }
    }

    // For images: auto-rotate after IDLE_TIMEOUT
    autoTimerRef.current = setTimeout(() => {
      stopVideo();
      setCurrent((prev) => (prev + 1) % media.length);
    }, IDLE_TIMEOUT);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [hasMedia, media.length, current, currentItem?.type, stopVideo]);

  // Play video when landing on a video item (only if user didn't interact)
  useEffect(() => {
    if (currentItem?.type === "video" && videoRef.current && !userInteractedRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current, currentItem?.type]);

  if (!hasMedia && !hasTicker) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      {hasMedia && (
        <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: "360px" }}>
          <div className="relative w-full" style={{ aspectRatio: "3/1", maxHeight: "360px" }}>
            {media.map((item, i) =>
              item.type === "video" ? (
                <video
                  key={i}
                  ref={i === current ? videoRef : undefined}
                  src={item.data}
                  muted={muted}
                  loop={false}
                  playsInline
                  preload="metadata"
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                    i === current ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                />
              ) : (
                <img
                  key={i}
                  src={item.data}
                  alt={`Ad ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              )
            )}
          </div>

          {media.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${
                      i === current
                        ? "bg-white w-4 h-2"
                        : item.type === "video"
                        ? "bg-blue-400/60 w-2 h-2"
                        : "bg-white/50 w-2 h-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {currentItem?.type === "video" && (
            <>
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-10"
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10 uppercase tracking-wider">
                VIDEO
              </span>
            </>
          )}
        </div>
      )}

      {hasTicker && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
          <div className="py-2.5 px-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded shrink-0">
              TIN TỨC
            </span>
            <div className="overflow-hidden flex-1 relative h-5">
              <div className="animate-marquee whitespace-nowrap absolute text-sm font-medium">
                {tickerText}
                <span className="inline-block w-16">&nbsp;</span>
                {tickerText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
