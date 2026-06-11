import { describe, expect, it } from "vitest";
import {
  isWidgetInquiryOptionConfigured,
  validateVisitorTopicsForSave,
} from "./visitor-topics.mapper";
import type { WidgetInquiryOption } from "./widget-inquiry.types";

const externalOnlyTopic: WidgetInquiryOption = {
  label: "Billing",
  routingKey: "billing",
  serviceChannel: "external",
  internalDepartmentId: null,
  externalDepartmentId: "dept-ext-1",
  internalPoolId: null,
  externalPoolId: null,
};

describe("validateVisitorTopicsForSave", () => {
  it("accepts external department only", () => {
    expect(validateVisitorTopicsForSave([externalOnlyTopic])).toBeNull();
  });

  it("rejects rows without external department", () => {
    expect(
      validateVisitorTopicsForSave([
        { ...externalOnlyTopic, externalDepartmentId: null },
      ]),
    ).toMatch(/external department/i);
  });
});

describe("isWidgetInquiryOptionConfigured", () => {
  it("requires label and external department", () => {
    expect(isWidgetInquiryOptionConfigured(externalOnlyTopic)).toBe(true);
    expect(
      isWidgetInquiryOptionConfigured({ ...externalOnlyTopic, label: "" }),
    ).toBe(false);
  });
});
