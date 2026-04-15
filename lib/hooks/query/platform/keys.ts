type Params = Record<string, unknown> | undefined;

export const platformKeys = {
  all: ["platform"] as const,
  licenseKeys: (params?: Params) =>
    [...platformKeys.all, "license-keys", params] as const,
};
