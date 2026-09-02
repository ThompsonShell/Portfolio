"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "asilbek.progress";

type ProgressMap = Record<string, number[]>;

function read(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function write(map: ProgressMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage blocked — progress just won't persist for this visitor.
  }
}

/** Per-visitor course progress, kept in the browser. There are no accounts,
 *  so this is deliberately local: nothing is sent to the API. */
export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);

  // Read after mount so server and first client render agree.
  useEffect(() => {
    setMap(read());
    setReady(true);
  }, []);

  const markWatched = useCallback((courseSlug: string, lectureId: number) => {
    if (!courseSlug) return;
    setMap((prev) => {
      const seen = prev[courseSlug] ?? [];
      if (seen.includes(lectureId)) return prev;
      const next = { ...prev, [courseSlug]: [...seen, lectureId] };
      write(next);
      return next;
    });
  }, []);

  const watchedIn = useCallback(
    (courseSlug: string) => map[courseSlug] ?? [],
    [map]
  );

  const isWatched = useCallback(
    (courseSlug: string, lectureId: number) =>
      (map[courseSlug] ?? []).includes(lectureId),
    [map]
  );

  /** 0–100, for the progress bars on course cards. */
  const percentFor = useCallback(
    (courseSlug: string, lessonCount: number) => {
      if (!lessonCount) return 0;
      const done = (map[courseSlug] ?? []).length;
      return Math.min(100, Math.round((done / lessonCount) * 100));
    },
    [map]
  );

  const resetCourse = useCallback((courseSlug: string) => {
    setMap((prev) => {
      const next = { ...prev };
      delete next[courseSlug];
      write(next);
      return next;
    });
  }, []);

  return { ready, markWatched, watchedIn, isWatched, percentFor, resetCourse };
}
