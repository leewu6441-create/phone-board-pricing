"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

interface AdBannerProps {
  mediaCount: number;
  mediaTypes: ("image" | "video")[];
  tickerText: string;
}

const IDLE_TIMEOUT = 10000;

export function AdBanner({ mediaCount, mediaTypes, tickerText }: AdBannerProps) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => { videoRef.current = el; }, []);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPausedRef = useRef(false);
  const hasMedia = mediaCount > 0;
  const hasTicker = tickerText.trim().length > 0;
  const isVideo = mediaTypes[current] === "video";

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // Navigation
  const goTo = useCallback((idx: number) => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    userPausedRef.current = true;
    clearTimer();
    setCurrent(idx);
  }, [clearTimer]);

  const goNext = useCallback(() => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    userPausedRef.current = true;
    clearTimer();
    setCurrent((c) => (c + 1) % mediaCount);
  }, [clearTimer, mediaCount]);

  const goPrev = useCallback(() => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    userPausedRef.current = true;
    clearTimer();
    setCurrent((c) => (c === 0 ? mediaCount - 1 : c - 1));
  }, [clearTimer, mediaCount]);

  // Main effect: video play + auto-advance
  useEffect(() => {
    if (!hasMedia || mediaCount <= 1) return;
    clearTimer();

    if (userPausedRef.current) {
      timerRef.current = setTimeout(() => {
        userPausedRef.current = false;
        setCurrent((prev) => (prev + 1) % mediaCount);
      }, IDLE_TIMEOUT);
      return () => clearTimer();
    }

    if (isVideo) {
      const tryPlay = (attempts: number) => {
        const video = videoRef.current;
        if (video) {
          video.currentTime = 0;
          video.muted = muted;
          const onEnded = () => setCurrent((prev) => (prev + 1) % mediaCount);
          video.addEventListener("ended", onEnded, { once: true });
          video.play().catch(() => {
            // Autoplay blocked, fallback: schedule next
            clearTimer();
            timerRef.current = setTimeout(() => {
              setCurrent((prev) => (prev + 1) % mediaCount);
            }, IDLE_TIMEOUT);
          });
          return () => {
            video.removeEventListener("ended", onEnded);
            video.pause();
          };
        } else if (attempts > 0) {
          const id = requestAnimationFrame(() => tryPlay(attempts - 1));
          return () => cancelAnimationFrame(id);
        }
      };
      return tryPlay(15);
    } else {
      // Image: schedule auto-advance
      timerRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % mediaCount);
      }, IDLE_TIMEOUT);
      return () => clearTimer();
    }
  }, [current, isVideo, hasMedia, mediaCount, muted, clearTimer]);

  if (!hasMedia && !hasTicker) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      {hasMedia && (
        <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: "360px" }}>
          <div className="relative w-full" style={{ aspectRatio: "3/1", maxHeight: "360px" }}>
            {/* Only render the current item to avoid loading all media at once */}
            <MediaItem
              type={mediaTypes[current]}
              index={current}
              isActive={true}
              muted={muted}
              setVideoRef={setVideoRef}
            />
          </div>

          {mediaCount > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-20">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-20">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {mediaTypes.map((type, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${
                      i === current ? "bg-white w-4 h-2" : type === "video" ? "bg-blue-400/60 w-2 h-2" : "bg-white/50 w-2 h-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {isVideo && (
            <>
              <button onClick={() => setMuted((m) => !m)} className="absolute bottom-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-20">
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-20 uppercase tracking-wider">VIDEO</span>
            </>
          )}
        </div>
      )}

      {hasTicker && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
          <div className="py-2.5 px-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded shrink-0">TIN TỨC</span>
            <div className="overflow-hidden flex-1 relative h-5">
              <div className="animate-marquee whitespace-nowrap absolute text-sm font-medium">
                {tickerText}<span className="inline-block w-16">&nbsp;</span>{tickerText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render a single media item via API
function MediaItem({
  type,
  index,
  isActive,
  muted,
  setVideoRef,
}: {
  type: "image" | "video";
  index: number;
  isActive: boolean;
  muted: boolean;
  setVideoRef: (el: HTMLVideoElement | null) => void;
}) {
  const src = `/api/ad-media?idx=${index}`;

  if (type === "video") {
    return (
      <video
        ref={isActive ? setVideoRef : undefined}
        src={isActive ? src : undefined}
        muted={muted}
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
          isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
        }`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`Ad ${index + 1}`}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
        isActive ? "opacity-100 z-10" : "opacity-0"
      }`}
    />
  );
}
