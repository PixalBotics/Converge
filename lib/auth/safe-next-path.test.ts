import { describe, expect, it } from "vitest";
import { parseSafeDashboardNextPath } from "./safe-next-path";

describe("parseSafeDashboardNextPath", () => {
  it("accepts dashboard paths", () => {
    expect(parseSafeDashboardNextPath("/dashboard")).toBe("/dashboard");
    expect(parseSafeDashboardNextPath("/dashboard/users")).toBe("/dashboard/users");
  });

  it("rejects external and non-dashboard paths", () => {
    expect(parseSafeDashboardNextPath("https://evil.com")).toBeNull();
    expect(parseSafeDashboardNextPath("/auth/login")).toBeNull();
    expect(parseSafeDashboardNextPath("//evil.com")).toBeNull();
  });

  it("decodes encoded paths", () => {
    expect(parseSafeDashboardNextPath(encodeURIComponent("/dashboard/settings"))).toBe("/dashboard/settings");
  });
});
