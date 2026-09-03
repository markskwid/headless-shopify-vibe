"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import type { HeaderAnnouncement } from "@/lib/sanity";

const AUTOPLAY_DELAY_MS = 5_000;

function announcementTarget(announcement: HeaderAnnouncement) {
  return announcement.openInNewTab
    ? { target: "_blank" as const, rel: "noreferrer" }
    : {};
}

function AnnouncementContent({
  announcement,
}: {
  announcement: HeaderAnnouncement;
}) {
  const className =
    "block truncate px-20 text-center text-xs font-medium tracking-wide sm:text-sm";

  return announcement.href ? (
    <Link
      href={announcement.href}
      className={`${className} underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70`}
      {...announcementTarget(announcement)}
    >
      {announcement.text}
    </Link>
  ) : (
    <p className={className}>{announcement.text}</p>
  );
}

export function AnnouncementBar({
  announcements,
}: {
  announcements: HeaderAnnouncement[];
}) {
  const isCarousel = announcements.length > 1;
  const [pausedByUser, setPausedByUser] = useState(false);
  const [pointerOver, setPointerOver] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "start",
    loop: isCarousel,
    watchDrag: isCarousel,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (
      !carouselApi ||
      !isCarousel ||
      pausedByUser ||
      pointerOver ||
      focusWithin ||
      reducedMotion
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!document.hidden) carouselApi.scrollNext();
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [
    carouselApi,
    focusWithin,
    isCarousel,
    pausedByUser,
    pointerOver,
    reducedMotion,
  ]);

  if (!announcements.length) return null;

  if (!isCarousel) {
    return (
      <aside
        data-announcement-bar
        aria-label="Store announcement"
        className="grid h-(--announcement-bar-height) items-center bg-primary text-primary-foreground"
      >
        <AnnouncementContent announcement={announcements[0]} />
      </aside>
    );
  }

  return (
    <aside
      data-announcement-bar
      aria-label="Store announcements"
      aria-roledescription="carousel"
      className="relative h-(--announcement-bar-height) bg-primary text-primary-foreground"
      onMouseEnter={() => setPointerOver(true)}
      onMouseLeave={() => setPointerOver(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
    >
      <div ref={carouselRef} className="h-full touch-pan-y overflow-hidden">
        <div className="flex h-full">
          {announcements.map((announcement) => (
            <div
              key={announcement._key}
              className="grid h-full min-w-0 flex-[0_0_100%] items-center"
              role="group"
              aria-roledescription="slide"
            >
              <AnnouncementContent announcement={announcement} />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="absolute inset-y-0 left-2 grid w-8 place-items-center rounded-sm opacity-75 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 motion-reduce:transition-none sm:left-4"
        onClick={() => carouselApi?.scrollPrev()}
        aria-label="Previous announcement"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <div className="absolute inset-y-0 right-2 flex items-center sm:right-4">
        {!reducedMotion ? (
          <button
            type="button"
            className="grid size-8 place-items-center rounded-sm opacity-75 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 motion-reduce:transition-none"
            onClick={() => setPausedByUser((current) => !current)}
            aria-label={pausedByUser ? "Play announcements" : "Pause announcements"}
            aria-pressed={pausedByUser}
          >
            {pausedByUser ? (
              <Play className="size-3.5" aria-hidden="true" />
            ) : (
              <Pause className="size-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
        <button
          type="button"
          className="grid size-8 place-items-center rounded-sm opacity-75 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 motion-reduce:transition-none"
          onClick={() => carouselApi?.scrollNext()}
          aria-label="Next announcement"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
