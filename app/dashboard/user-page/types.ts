export interface UserRow extends Record<string, unknown> {
  id: string;
  licenseKey?: string;
  user: string;
  email: string;
  type: "Internal" | "External";
  department: string;
  role: string;
  company: string;
}

export type UnknownRecord = Record<string, unknown>;

export type UserSuggestion = {
  id: string;
  label: string;
};

export const FILTER_KIND_OPTIONS = [
  { value: "user", label: "User" },
  { value: "company", label: "Company" },
  { value: "parentCompany", label: "Parent Company" },
  { value: "reseller", label: "Reseller" },
  { value: "role", label: "Role" },
  { value: "department", label: "Department" },
  { value: "designation", label: "Designation" },
] as const;

export type FilterKind = (typeof FILTER_KIND_OPTIONS)[number]["value"];
