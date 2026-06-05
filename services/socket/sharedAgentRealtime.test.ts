import { describe, expect, it, beforeEach } from "vitest";
import {
  consumeAgentRealtimeTokenChange,
  resetAgentRealtimeToken,
} from "./sharedAgentRealtime";

describe("sharedAgentRealtime", () => {
  beforeEach(() => {
    resetAgentRealtimeToken();
  });

  it("returns true only on the first connect for a token", () => {
    expect(consumeAgentRealtimeTokenChange("token-a")).toBe(true);
    expect(consumeAgentRealtimeTokenChange("token-a")).toBe(false);
  });

  it("returns true again when the token changes", () => {
    consumeAgentRealtimeTokenChange("token-a");
    expect(consumeAgentRealtimeTokenChange("token-b")).toBe(true);
    expect(consumeAgentRealtimeTokenChange("token-b")).toBe(false);
  });
});
