"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  isHls?: boolean;
}

export const VideoBackground = ({
  src,
  poster,
  className = "",
  isHls = false,
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHls && src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }
  }, [src, isHls]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
    />
  );
};
