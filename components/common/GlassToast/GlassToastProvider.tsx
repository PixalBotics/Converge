"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import { subscribeAppToasts, type AppToastPayload } from "@/lib/notify";
import styles from "./GlassToast.module.css";

type ToastItem = AppToastPayload & { id: string };

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 3200;

export function GlassToastProvider({ children }: { children: React.ReactNode }) {
  const baseId = useId();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let seq = 0;
    const timerMap = timersRef.current;

    const unsub = subscribeAppToasts((payload) => {
      const id = `${baseId}-${++seq}-${Date.now()}`;
      setItems((prev) => {
        const next: ToastItem[] = [{ id, ...payload }, ...prev];
        return next.slice(0, MAX_VISIBLE);
      });
      timerMap.set(
        id,
        setTimeout(() => {
          timerMap.delete(id);
          dismiss(id);
        }, AUTO_DISMISS_MS),
      );
    });

    return () => {
      unsub();
      timerMap.forEach((handle) => clearTimeout(handle));
      timerMap.clear();
    };
  }, [baseId, dismiss]);

  const portal =
    mounted &&
    createPortal(
      <Box
        className={styles.anchor}
        role="region"
        aria-label="Notifications"
        data-testid="glass-toast-region"
      >
        {items.map((t) => {
          const isSuccess = t.variant === "success";
          return (
            <Box
              key={t.id}
              className={`${styles.card} ${isSuccess ? styles.cardSuccess : styles.cardError}`}
              role={isSuccess ? "status" : "alert"}
              aria-live={isSuccess ? "polite" : "assertive"}
            >
              <Box className={styles.leadIcon} aria-hidden>
                {isSuccess ? (
                  <CheckRoundedIcon className={styles.iconSuccess} sx={{ fontSize: 18 }} />
                ) : (
                  <PriorityHighRoundedIcon className={styles.iconError} sx={{ fontSize: 18 }} />
                )}
              </Box>
              <Box component="p" className={styles.message}>
                {t.message}
              </Box>
              <IconButton
                className={styles.close}
                size="small"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>,
      document.body,
    );

  return (
    <>
      {children}
      {portal}
    </>
  );
}
