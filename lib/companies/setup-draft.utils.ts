import type { JsonRecord } from "@/api";

const DEFAULT_POC_INVITE_PASSWORD = "Admin@123";
const POC_EMAIL_MAX_LEN = 255;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Parses `POST /companies/setup/draft` (201) response for the draft row id. */
export function extractCompanySetupDraftId(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;
  const direct = String(root.id ?? "").trim();
  if (direct) return direct;
  const nested = asRecord(root.data);
  if (nested) {
    const id = String(nested.id ?? nested.draftId ?? "").trim();
    if (id) return id;
  }
  return null;
}

/** Latest-draft GET: `data: null` or envelope with run id inside `data`. */
export function extractCompanySetupDraftIdFromLatest(data: unknown): string | null {
  const root = asRecord(data);
  if (root && "data" in root && root.data === null) return null;
  const inner = root && "data" in root && root.data !== undefined ? root.data : data;
  return extractCompanySetupDraftId(inner);
}

export type DraftChildPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  /** One row per site; empty strings allowed while editing; normalized to `https://` on PATCH. */
  websiteUrls: string[];
  pocFirstName: string;
  pocMiddleName: string;
  pocLastName: string;
  pocEmail: string;
  roleId: string;
  pocDepartmentMode: "existing" | "new";
  pocDepartmentId: string;
  /** API `departmentName` — synced from department dropdown label or typed for new dept. */
  pocDepartmentName: string;
  pocDepartmentNewDescription: string;
  pocDesignationMode: "existing" | "new";
  pocDesignationId: string;
  /** API `designationTitle` — synced from designation dropdown label or typed for new title. */
  pocDesignationTitle: string;
  pocDesignationNewDetails: string;
};

function emptyPocSlice(): Pick<
  DraftChildPayload,
  | "pocFirstName"
  | "pocMiddleName"
  | "pocLastName"
  | "pocEmail"
  | "roleId"
  | "pocDepartmentMode"
  | "pocDepartmentId"
  | "pocDepartmentName"
  | "pocDepartmentNewDescription"
  | "pocDesignationMode"
  | "pocDesignationId"
  | "pocDesignationTitle"
  | "pocDesignationNewDetails"
> {
  return {
    pocFirstName: "",
    pocMiddleName: "",
    pocLastName: "",
    pocEmail: "",
    roleId: "",
    pocDepartmentMode: "existing",
    pocDepartmentId: "",
    pocDepartmentName: "",
    pocDepartmentNewDescription: "",
    pocDesignationMode: "existing",
    pocDesignationId: "",
    pocDesignationTitle: "",
    pocDesignationNewDetails: "",
  };
}

function parsePocFromChildRow(c: Record<string, unknown>): Pick<
  DraftChildPayload,
  | "pocFirstName"
  | "pocMiddleName"
  | "pocLastName"
  | "pocEmail"
  | "roleId"
  | "pocDepartmentMode"
  | "pocDepartmentId"
  | "pocDepartmentName"
  | "pocDepartmentNewDescription"
  | "pocDesignationMode"
  | "pocDesignationId"
  | "pocDesignationTitle"
  | "pocDesignationNewDetails"
> {
  const poc = asRecord(c.pocInvite);
  if (!poc) return emptyPocSlice();
  const deptName = String(poc.departmentName ?? "").trim();
  const desTitle = String(poc.designationTitle ?? "").trim();
  return {
    pocFirstName: String(poc.firstName ?? "").trim(),
    pocMiddleName: String(poc.middleName ?? "").trim(),
    pocLastName: String(poc.lastName ?? "").trim(),
    pocEmail: String(poc.pocEmail ?? poc.email ?? "").trim(),
    roleId: String(poc.roleId ?? "").trim(),
    pocDepartmentMode: "new",
    pocDepartmentId: "",
    pocDepartmentName: deptName,
    pocDepartmentNewDescription: String(poc.departmentDetails ?? "").trim(),
    pocDesignationMode: "new",
    pocDesignationId: "",
    pocDesignationTitle: desTitle,
    pocDesignationNewDetails: String(poc.designationDetails ?? "").trim(),
  };
}

/** True when POC invite fields are ready for `pocInvite` on PATCH. */
export function isChildRowPocComplete(r: DraftChildPayload): boolean {
  const pocEmail = r.pocEmail.trim();
  if (
    !r.pocFirstName.trim() ||
    !r.pocLastName.trim() ||
    !pocEmail ||
    pocEmail.length > POC_EMAIL_MAX_LEN ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pocEmail) ||
    !r.roleId.trim()
  ) {
    return false;
  }
  if (r.pocDepartmentMode === "new") {
    if (!r.pocDepartmentName.trim()) return false;
  } else if (!r.pocDepartmentId.trim() || !r.pocDepartmentName.trim()) {
    return false;
  }
  if (r.pocDesignationMode === "new") {
    if (!r.pocDesignationTitle.trim()) return false;
  } else if (!r.pocDesignationId.trim() || !r.pocDesignationTitle.trim()) {
    return false;
  }
  return true;
}

/** Builds `pocInvite` JSON for PATCH (parent or child company). */
export function buildPocInviteForRow(c: DraftChildPayload): JsonRecord | null {
  if (!isChildRowPocComplete(c)) return null;
  const pocEmail = c.pocEmail.trim().slice(0, POC_EMAIL_MAX_LEN);
  const invite: JsonRecord = {
    firstName: c.pocFirstName.trim(),
    lastName: c.pocLastName.trim(),
    /** API DTO uses `pocEmail`, not `email`. */
    pocEmail,
    password: DEFAULT_POC_INVITE_PASSWORD,
    roleId: c.roleId.trim(),
    departmentName: c.pocDepartmentName.trim(),
    designationTitle: c.pocDesignationTitle.trim(),
  };
  const mid = c.pocMiddleName.trim();
  if (mid) invite.middleName = mid;
  if (c.pocDepartmentMode === "new" && c.pocDepartmentNewDescription.trim()) {
    invite.departmentDetails = c.pocDepartmentNewDescription.trim();
  }
  /** API rejects `designationDetails` on `pocInvite`; `designationTitle` carries the title. */
  return invite;
}

/** Trim, force `https://`, prepend if host-only (e.g. `example.com` → `https://example.com`). */
export function normalizeHttpsWebsiteUrl(raw: string): string {
  let v = raw.trim();
  if (!v) return "";
  v = v.replace(/^http:\/\//i, "https://");
  if (!/^https:\/\//i.test(v)) {
    v = `https://${v.replace(/^\/+/, "")}`;
  }
  return v;
}

/** Deduped list of non-empty https URLs for API payloads. */
export function collectHttpsWebsiteUrls(urls: string[]): string[] {
  const out: string[] = [];
  for (const raw of urls) {
    const u = normalizeHttpsWebsiteUrl(raw);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

export function emptyDraftChildRow(): DraftChildPayload {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
    websiteUrls: [""],
    ...emptyPocSlice(),
  };
}

export type CompanySetupWizardHydration = {
  setupKind: "new_reseller" | "existing_reseller";
  resellerId: string;
  parentCompanyName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  draftChildRows: DraftChildPayload[];
  modalStep: 1 | 2;
};

/** GET payloads sometimes nest step state under `form` or `draft`. */
function resolveCompanySetupDraftBase(envelope: Record<string, unknown>): Record<string, unknown> | null {
  const base =
    "data" in envelope && envelope.data !== undefined && envelope.data !== null
      ? asRecord(envelope.data)
      : envelope;
  return base;
}

function pickNestedDraftSlice(base: Record<string, unknown>): Record<string, unknown> | null {
  return asRecord(base.form) ?? asRecord(base.draft);
}

function extractChildrenArray(childrenDraft: Record<string, unknown> | null): unknown[] {
  if (!childrenDraft) return [];
  if (Array.isArray(childrenDraft.children)) return childrenDraft.children;
  if (Array.isArray(childrenDraft.items)) return childrenDraft.items;
  return [];
}

/** GET may return `childrenDraft` as an array, or `{ children: [...] }`, or nested under `form` / `draft`. */
function takeChildrenArrayFromDraftValue(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return extractChildrenArray(asRecord(value));
}

/** Maps GET `/companies/setup/draft/{id}` (or latest `data`) into wizard state. */
export function parseCompanySetupDraftRunForWizard(data: unknown): CompanySetupWizardHydration | null {
  const envelope = asRecord(data);
  if (!envelope) return null;
  const base = resolveCompanySetupDraftBase(envelope);
  if (!base) return null;

  const nested = pickNestedDraftSlice(base);
  const parentDraft =
    asRecord(base.resellerParentDraft) ??
    (nested ? asRecord(nested.resellerParentDraft) : null);
  const modeRaw = String(parentDraft?.mode ?? "").toLowerCase();
  const rootResellerId = String(base.resellerId ?? "").trim();
  /** Create-mode drafts may still carry `resellerId` on `data` for tree context — treat as existing for the wizard. */
  const setupKind: "new_reseller" | "existing_reseller" =
    modeRaw === "existing" || rootResellerId.length > 0 ? "existing_reseller" : "new_reseller";

  const resellerId = String(parentDraft?.resellerId ?? base.resellerId ?? "").trim();
  const parent = asRecord(parentDraft?.parent);
  const parentCompanyName = String(parent?.name ?? "").trim();
  const parentEmail = String(parent?.email ?? "").trim();
  const parentPhone = String(parent?.phone ?? "").trim();
  const parentAddress = String(parent?.address ?? "").trim();

  const nestedChildrenVal = nested ? (nested as Record<string, unknown>).childrenDraft : undefined;
  let rawChildren = takeChildrenArrayFromDraftValue(base.childrenDraft);
  if (rawChildren.length === 0) {
    rawChildren = takeChildrenArrayFromDraftValue(nestedChildrenVal);
  }
  if (rawChildren.length === 0 && Array.isArray(base.children)) {
    rawChildren = base.children as unknown[];
  }
  const draftChildRows: DraftChildPayload[] =
    rawChildren.length === 0
      ? [emptyDraftChildRow()]
      : (rawChildren as unknown[]).map((row) => {
          const c = asRecord(row);
          if (!c) return emptyDraftChildRow();
          const websiteUrls: string[] = [];
          const multi = c.websites;
          if (Array.isArray(multi)) {
            for (const item of multi) {
              const o = asRecord(item);
              if (o?.url != null) websiteUrls.push(String(o.url));
            }
          }
          const w = asRecord(c.website);
          if (w?.url != null) {
            const u = String(w.url);
            if (!websiteUrls.includes(u)) websiteUrls.unshift(u);
          }
          return {
            name: String(c.name ?? "").trim(),
            email: String(c.email ?? "").trim(),
            phone: String(c.phone ?? "").trim(),
            address: String(c.address ?? "").trim(),
            websiteUrls: websiteUrls.length > 0 ? websiteUrls : [""],
            ...parsePocFromChildRow(c),
          };
        });

  const nextActionRaw =
    base.nextAction ?? (nested && "nextAction" in nested ? nested.nextAction : undefined);
  const nextAction = String(nextActionRaw ?? "").toLowerCase();
  let modalStep: 1 | 2 = 1;
  if (nextAction.includes("child") || nextAction.includes("children")) {
    modalStep = 2;
  } else {
    const hasSavedChildBasics = draftChildRows.some(
      (r) =>
        r.name.trim().length > 0 &&
        r.email.trim().length > 0 &&
        r.phone.trim().length > 0 &&
        r.address.trim().length > 0,
    );
    const hasCompleteChild = draftChildRows.some(
      (r) =>
        r.name.trim().length > 0 &&
        r.email.trim().length > 0 &&
        r.phone.trim().length > 0 &&
        r.address.trim().length > 0 &&
        isChildRowPocComplete(r),
    );
    if (hasCompleteChild || hasSavedChildBasics) modalStep = 2;
  }

  return {
    setupKind,
    resellerId,
    parentCompanyName,
    parentEmail,
    parentPhone,
    parentAddress,
    draftChildRows,
    modalStep,
  };
}

export type ResellerParentDraftPatchInput =
  | {
      kind: "existing_reseller";
      resellerId: string;
      parentCompanyId?: string;
      parent: { name: string; email: string; phone: string; address: string };
    }
  | {
      kind: "new_reseller";
      parent: { name: string; email: string; phone: string; address: string };
    };

/** PATCH step `reseller_parent`. API `mode`: `create` (new tree, no reseller id) | `existing` (under chosen reseller). */
export function buildResellerParentDraftPatchBody(
  opts: ResellerParentDraftPatchInput,
): JsonRecord {
  const parent = {
    name: opts.parent.name.trim(),
    email: opts.parent.email.trim(),
    phone: opts.parent.phone.trim(),
    address: opts.parent.address.trim(),
  };

  if (opts.kind === "new_reseller") {
    return {
      step: "reseller_parent",
      finalize: "reseller_parent",
      resellerParentDraft: {
        mode: "create",
        parent,
      },
    };
  }

  const body: JsonRecord = {
    step: "reseller_parent",
    finalize: "reseller_parent",
    resellerParentDraft: {
      mode: "existing",
      resellerId: opts.resellerId.trim(),
      parent,
    },
  };
  const pid = opts.parentCompanyId?.trim();
  if (pid) {
    (body.resellerParentDraft as JsonRecord).parentCompanyId = pid;
  }
  return body;
}

export function buildChildrenDraftPatchBody(children: DraftChildPayload[]): JsonRecord {
  const mapped = children
    .filter((c) => c.name.trim().length > 0)
    .map((c) => {
      const row: JsonRecord = {
        name: c.name.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        address: c.address.trim(),
      };
      /** API allows only `website` (singular), not `websites`. Use first normalized URL when several are entered. */
      const urls = collectHttpsWebsiteUrls(c.websiteUrls ?? []);
      if (urls.length > 0) {
        row.website = { url: urls[0] };
      }
      const poc = buildPocInviteForRow(c);
      if (poc) row.pocInvite = poc;
      return row;
    });
  return {
    step: "children",
    childrenDraft: {
      children: mapped,
    },
  };
}

/** Browser key for resuming company setup after leaving the wizard (same device). */
export const COMPANIES_SETUP_DRAFT_ID_STORAGE_KEY = "converge:companies-setup-draft-id";

export function getStoredCompanySetupDraftId(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(COMPANIES_SETUP_DRAFT_ID_STORAGE_KEY)?.trim();
  return v && v.length > 0 ? v : null;
}

export function setStoredCompanySetupDraftId(id: string | null | undefined): void {
  if (typeof window === "undefined") return;
  const trimmed = id?.trim();
  if (trimmed) localStorage.setItem(COMPANIES_SETUP_DRAFT_ID_STORAGE_KEY, trimmed);
  else localStorage.removeItem(COMPANIES_SETUP_DRAFT_ID_STORAGE_KEY);
}
