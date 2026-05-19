import { describe, expect, it } from "vitest";
import { joinUrl } from "./http-path";

describe("joinUrl", () => {
  it("preserves leading slash on path", () => {
    expect(joinUrl("https://api.example.com", "/health")).toBe("https://api.example.com/health");
  });

  it("inserts slash when path has no leading slash", () => {
    expect(joinUrl("https://api.example.com", "v1/users")).toBe("https://api.example.com/v1/users");
  });
});
