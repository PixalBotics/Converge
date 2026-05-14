"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        background: "linear-gradient(180deg, #050508 0%, #0a0a2c 100%)",
      }}
    >
      <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
      <p style={{ margin: 0, opacity: 0.85, textAlign: "center", maxWidth: 420 }}>
        Please try again. If the problem continues, contact support.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          cursor: "pointer",
          padding: "10px 20px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  );
}
