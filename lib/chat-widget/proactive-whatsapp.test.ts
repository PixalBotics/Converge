import { describe, expect, it } from "vitest";
import { normalizeWhatsAppHref, validateWhatsAppHref } from "./proactive-whatsapp";

describe("normalizeWhatsAppHref", () => {
  it("builds wa.me from phone digits", () => {
    expect(normalizeWhatsAppHref("+1 (555) 010-0099")).toBe("https://wa.me/15550100099");
  });

  it("keeps full https links", () => {
    expect(normalizeWhatsAppHref("https://wa.me/15550100")).toBe("https://wa.me/15550100");
  });
});

describe("validateWhatsAppHref", () => {
  it("accepts normalized phone numbers", () => {
    expect(validateWhatsAppHref("15550100")).toBeNull();
  });

  it("rejects empty input", () => {
    expect(validateWhatsAppHref("")).toMatch(/required|enter/i);
  });
});
