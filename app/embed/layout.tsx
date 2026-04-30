import type { ReactNode } from "react";

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body:has([data-converge-embed-root]) {
              background: transparent !important;
              min-height: 100% !important;
            }
          `,
        }}
      />
      <div
        data-converge-embed-root
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          width: "100%",
          background: "transparent",
        }}
      >
        {children}
      </div>
    </>
  );
}
