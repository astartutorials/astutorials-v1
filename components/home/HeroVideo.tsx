'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * The hero video, without the cost up front. The poster paints immediately
 * as a priority image; the video loads only after the page has finished loading, at a
 * size picked for the screen (480px for phones, 640px otherwise), and not at
 * all when the visitor has data saver on.
 *
 * It used to be a 10 MB file that autoplayed with no poster on every visit
 * (2026-11-12). Re-encode with ffmpeg: crop to the visible square, drop the
 * silent audio track, CRF 34/35.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const start = () => {
      video.src = window.matchMedia("(max-width: 640px)").matches ? "/hero/hero-480.mp4" : "/hero/hero-640.mp4";
      video.play().catch(() => {});
    };
    // Two seconds after load, so the download never competes with first paint
    // on a slow connection; the poster covers the wait.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const later = () => { timer = setTimeout(start, 2000); };

    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // The poster is a real, high-priority image: it is the largest thing on
  // screen at load (what Google times as LCP), and a <video poster> is fetched
  // late, at low priority. The video fades in over it once it is playing.
  return (
    <>
      <Image
        src="/hero/hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 512px, 100vw"
        className="object-cover"
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
