import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolveWidgetApiOrigin,
  resolveWidgetEmbedAppOrigin,
} from "./widget-embed-api-origin";

describe("resolveWidgetEmbedAppOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers dedicated embed env over API when they differ", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    vi.stubEnv("NEXT_PUBLIC_WIDGET_EMBED_ORIGIN", "https://app.example.com");
    expect(resolveWidgetEmbedAppOrigin()).toBe("https://app.example.com");
  });

  it("ignores embed env when it equals the API host", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    vi.stubEnv("NEXT_PUBLIC_WIDGET_EMBED_ORIGIN", "https://api.example.com");
    expect(
      resolveWidgetEmbedAppOrigin({
        browserOrigin: "https://app.example.com",
      }),
    ).toBe("https://app.example.com");
  });

  it("uses browser origin when env points at API", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://convergit-saas.onrender.com");
    vi.stubEnv(
      "NEXT_PUBLIC_WIDGET_EMBED_ORIGIN",
      "https://convergit-saas.onrender.com",
    );
    expect(
      resolveWidgetEmbedAppOrigin({
        browserOrigin: "https://theconverge.netlify.app",
      }),
    ).toBe("https://theconverge.netlify.app");
  });

  it("prefers server embed hint from embed-snippet API", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    vi.stubEnv("NEXT_PUBLIC_WIDGET_EMBED_ORIGIN", "https://api.example.com");
    expect(
      resolveWidgetEmbedAppOrigin({
        apiEmbedAppOrigin: "https://cdn-app.example.com",
        browserOrigin: "https://dashboard.example.com",
      }),
    ).toBe("https://cdn-app.example.com");
  });
});

describe("resolveWidgetApiOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads NEXT_PUBLIC_API_BASE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");
    expect(resolveWidgetApiOrigin()).toBe("https://api.example.com");
  });
});
