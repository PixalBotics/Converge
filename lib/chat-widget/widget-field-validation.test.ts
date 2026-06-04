import { describe, expect, it } from "vitest";
import {
  parseDomainListInput,
  validateDomainListInput,
  validateSingleHttpUrl,
} from "./widget-field-validation";

describe("widget-field-validation", () => {
  it("rejects two urls in one field", () => {
    expect(
      validateSingleHttpUrl("https://a.com https://b.com", { label: "Link" }),
    ).toMatch(/single/i);
  });

  it("parses domain list from comma and strips url paths", () => {
    expect(
      parseDomainListInput("example.com, https://app.foo.com/bar"),
    ).toEqual(["example.com", "app.foo.com"]);
  });

  it("validates domain list", () => {
    expect(validateDomainListInput("not a domain!!!")).not.toBeNull();
    expect(validateDomainListInput("example.com")).toBeNull();
    expect(validateDomainListInput("localhost:3000")).toBeNull();
    expect(validateDomainListInput("localhost")).toBeNull();
    expect(validateDomainListInput("127.0.0.1:3000")).toBeNull();
  });

  it("preserves port when parsing localhost urls", () => {
    expect(parseDomainListInput("http://localhost:3000/demo")).toEqual(["localhost:3000"]);
    expect(parseDomainListInput("localhost:3000")).toEqual(["localhost:3000"]);
  });
});
