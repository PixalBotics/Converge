import { describe, expect, it } from "vitest";
import {
  buildDynamicPrechatZod,
  extractPrechatFieldsFromWidgetConfig,
  normalizePrechatFields,
  type PrechatFieldDto,
} from "@/lib/widget-runtime/prechat-form";

describe("normalizePrechatFields", () => {
  it("maps fieldKey to key and dedupes collisions", () => {
    const out = normalizePrechatFields([
      { key: "", fieldKey: "full_name", label: "Name", required: true } as PrechatFieldDto & {
        fieldKey: string;
      },
      { key: "email", label: "Email", type: "email" },
    ]);
    expect(out.map((f) => f.key)).toEqual(["full_name", "email"]);
  });
});

describe("buildDynamicPrechatZod", () => {
  it("accepts empty values when no fields configured", () => {
    const schema = buildDynamicPrechatZod([]);
    expect(schema.safeParse({}).success).toBe(true);
  });
});

describe("extractPrechatFieldsFromWidgetConfig", () => {
  it("reads prechat toggles from experience form blob", () => {
    const fields = extractPrechatFieldsFromWidgetConfig({
      form: {
        prechatNameEnabled: true,
        prechatEmailEnabled: true,
        prechatPhoneEnabled: false,
        prechatMessageEnabled: true,
        prechatMessageRequired: true,
      },
    });
    expect(fields.map((f) => f.key)).toEqual(["name", "email", "message"]);
    expect(fields.find((f) => f.key === "message")?.required).toBe(true);
  });
});
