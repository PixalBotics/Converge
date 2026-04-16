"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

/**
 * Locks document body scroll while `locked` is true (e.g. modal open).
 * Ref-counted so nested modals (e.g. confirm on top of form) restore scroll only when all close.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      if (typeof document === "undefined") return;
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [locked]);
}
