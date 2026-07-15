"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AdBannerProps {
  mediaCount: number;
  mediaTypes: ("image" | "video")[];
  mediaLinks: string[];
  mediaSrcs: string[];
  tickerText: string;
}

const IDLE_TIMEOUT = 10000;

function isChinese(text: string): boolean {
  return /[一-鿿㐀-䶿]/.test(text);
}

const transCache: Record<string, string> = {};

export function AdBanner({ mediaCount, mediaTypes, mediaLinks, mediaSrcs, tickerText }: AdBannerProps) {
  const { lang } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  const [displayTicker, setDisplayTicker] = useState(tickerText);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => { videoRef.current = el; }, []);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPausedRef = useRef(false);
  const hasMedia = mediaCount > 0;
  const hasTicker = tickerText.trim().length > 0;
  const isVideo = mediaTypes[current] === "video";
  const currentLink = mediaLinks[current] || "";
  const currentSrc = mediaSrcs[current] || "";

  // Auto-translate ticker
  useEffect(() => {
    if (!tickerText.trim()) { setDisplayTicker(""); return; }
    const needsTranslation = isChinese(tickerText) && lang !== "zh";
    const targetLang = lang === "en" ? "en" : lang === "zh" ? "zh" : "vi";
    const sourceLang = isChinese(tickerText) ? "zh" : "auto";
    if (!needsTranslation && lang === "zh") { setDisplayTicker(tickerText); return; }
    if (!needsTranslation && lang === "vi" && !isChinese(tickerText)) { setDisplayTicker(tickerText); return; }
    const cacheKey = `${sourceLang}:${targetLang}:${tickerText}`;
    if (transCache[cacheKey]) { setDisplayTicker(transCache[cacheKey]); return; }
    fetch(`/api/translate?text=${encodeURIComponent(tickerText)}&from=${sourceLang}&to=${targetLang}`)
      .then((r) => r.json())
      .then((data) => { if (data.text) { transCache[cacheKey] = data.text; setDisplayTicker(data.text); } })
      .catch(() => setDisplayTicker(tickerText));
  }, [tickerText, lang]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setStarted(false);
      setShowPlayBtn(false);
    }
  }, []);

  const manualPlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = muted;
      video.play().then(() => {
        setStarted(true);
        setShowPlayBtn(false);
      }).catch(() => {});
    }
  }, [muted]);

  const goTo = useCallback((idx: number) => {
    stopVideo();
    userPausedRef.current = true;
    clearTimer();
    setCurrent(idx);
  }, [stopVideo, clearTimer]);

  const goNext = useCallback(() => {
    stopVideo();
    userPausedRef.current = true;
    clearTimer();
    setCurrent((c) => (c + 1) % mediaCount);
  }, [stopVideo, clearTimer, mediaCount]);

  const goPrev = useCallback(() => {
    stopVideo();
    userPausedRef.current = true;
    clearTimer();
    setCurrent((c) => (c === 0 ? mediaCount - 1 : c - 1));
  }, [stopVideo, clearTimer, mediaCount]);

  // Auto-advance
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
      setShowPlayBtn(false);
      const video = videoRef.current;
      if (video) {
        video.muted = muted;
        video.currentTime = 0;
        const onEnded = () => setCurrent((prev) => (prev + 1) % mediaCount);
        video.addEventListener("ended", onEnded, { once: true });
        video.play().then(() => {
          setStarted(true);
          setShowPlayBtn(false);
        }).catch(() => {
          // Autoplay blocked (mobile) — show play button
          setShowPlayBtn(true);
          clearTimer();
        });
        return () => {
          video.removeEventListener("ended", onEnded);
          video.pause();
        };
      }
    }

    if (!isVideo) {
      timerRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % mediaCount);
      }, IDLE_TIMEOUT);
      return () => clearTimer();
    }
  }, [current, isVideo, hasMedia, mediaCount, clearTimer]);

  if (!hasMedia && !hasTicker) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      {hasMedia && (
        <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: "480px" }}>
          <div className="relative w-full" style={{ aspectRatio: "2/1", maxHeight: "480px" }}>
            {isVideo ? (
              <>
                <video
                  ref={setVideoRef}
                  src={currentSrc}
                  muted={muted}
                  playsInline
                  webkit-playsinline="true"
                  x5-video-player-type="h5"
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-contain z-10"
                />
                {showPlayBtn && (
                  <button onClick={manualPlay} className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-gray-900 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <img
                src={currentSrc}
                alt="Ad"
                className="absolute inset-0 w-full h-full object-contain opacity-100 z-10"
              />
            )}
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
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${i === current ? "bg-white w-4 h-2" : type === "video" ? "bg-blue-400/60 w-2 h-2" : "bg-white/50 w-2 h-2"}`}
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

          {currentLink && (
            <a href={currentLink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-15" />
          )}
        </div>
      )}

      {hasTicker && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
          <div className="py-2.5 px-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded shrink-0">TIN TỨC</span>
            <div className="overflow-hidden flex-1 relative h-5">
              <div className="animate-marquee whitespace-nowrap absolute text-sm font-medium">
                {displayTicker}<span className="inline-block w-16">&nbsp;</span>{displayTicker}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
