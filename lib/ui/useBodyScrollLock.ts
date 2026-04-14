"use client";

import { useLayoutEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

/**
 * Locks document body scroll while `locked` is true (e.g. modal open).
 * Ref-counted so nested modals (e.g. confirm on top of form) restore scroll only when all close.
 */
export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [locked]);
}
