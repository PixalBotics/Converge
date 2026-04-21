export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Pull list payloads from common API envelope shapes. */
export function pickItemsArray(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.items)) return root.items as unknown[];
  const data = asRecord(root.data);
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items as unknown[];
  if (Array.isArray(data)) return data as unknown[];
  return [];
}

export function toIdNameOption(row: unknown): { value: string; label: string } | null {
  const o = asRecord(row);
  if (!o) return null;
  const id = String(o.id ?? "").trim();
  if (!id) return null;
  const label = String(o.name ?? o.label ?? o.title ?? o.companyName ?? "").trim() || id;
  return { value: id, label };
}

function firstArrayObject(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  return asRecord(value[0]);
}

/** Normalize `GET /users/:id` (and similar) envelopes to a flat user object. */
export function extractUserRecordFromDetailPayload(
  payload: unknown,
): Record<string, unknown> | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data);
  const payloadObj = asRecord(root.payload);
  const nestedUser =
    asRecord(root.user)
    ?? asRecord(data?.user)
    ?? asRecord(root.item)
    ?? asRecord(data?.item)
    ?? asRecord(data?.record)
    ?? asRecord(payloadObj?.user)
    ?? firstArrayObject(root.data)
    ?? firstArrayObject(data?.items)
    ?? firstArrayObject(data?.rows)
    ?? firstArrayObject(data?.results)
    ?? firstArrayObject(data?.users);
  if (nestedUser && (nestedUser.email != null || nestedUser.firstName != null || nestedUser.first_name != null || nestedUser.id != null)) {
    return nestedUser;
  }
  if (data && (data.email != null || data.firstName != null || data.first_name != null || data.id != null)) {
    return data;
  }
  if (root.email != null || root.firstName != null || root.first_name != null || root.id != null) {
    return root;
  }
  return null;
}

export type ParentCompanyOption = {
  value: string;
  label: string;
  /** Passed to `GET /hrms/departments?type=` when present on parent company. */
  type?: string;
};

/**
 * `GET /companies/by-reseller/:id?view=tree` — parent companies live under
 * `data.items[].parentCompanies[]` (each may include `childCompanies`).
 */
export function extractParentCompaniesFromByResellerTree(
  payload: unknown,
): ParentCompanyOption[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  if (!data) return [];

  const view = String(data.view ?? "").toLowerCase();
  const items = Array.isArray(data.items) ? (data.items as unknown[]) : [];

  if (view === "tree") {
    const byId = new Map<string, ParentCompanyOption>();
    for (const raw of items) {
      const item = asRecord(raw);
      if (!item) continue;
      const parents = Array.isArray(item.parentCompanies)
        ? (item.parentCompanies as unknown[])
        : [];
      for (const pRaw of parents) {
        const p = asRecord(pRaw);
        if (!p) continue;
        const id = String(p.id ?? "").trim();
        if (!id) continue;
        const label = String(p.name ?? "").trim() || id;
        const typeRaw = p.type ?? p.companyType ?? p.departmentType;
        const type =
          typeRaw != null && String(typeRaw).trim().length > 0
            ? String(typeRaw).trim()
            : undefined;
        byId.set(id, { value: id, label, type });
      }
    }
    return Array.from(byId.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
  }

  return extractParentCompaniesFromFlatItems(payload);
}

type CompanyRow = {
  id: string;
  name: string;
  parentCompanyId: string | null;
};

function toCompanyRow(row: unknown): CompanyRow | null {
  const o = asRecord(row);
  if (!o) return null;
  const id = String(o.id ?? "").trim();
  if (!id) return null;
  const name = String(o.name ?? o.companyName ?? "").trim() || id;
  const parentObj = asRecord(o.parentCompany);
  const rawPid = o.parentCompanyId;
  const pid =
    rawPid != null && String(rawPid).trim().length > 0
      ? String(rawPid).trim()
      : parentObj?.id != null && String(parentObj.id).trim().length > 0
        ? String(parentObj.id).trim()
        : null;
  return { id, name, parentCompanyId: pid };
}

/** Legacy `view=flat` style rows (or unknown shapes). */
function extractParentCompaniesFromFlatItems(payload: unknown): ParentCompanyOption[] {
  const items = pickItemsArray(payload);
  const rows = items.map(toCompanyRow).filter((r): r is CompanyRow => !!r);
  const byId = new Map(rows.map((r) => [r.id, r]));

  const roots = rows.filter((r) => !r.parentCompanyId);
  if (roots.length > 0) {
    return roots
      .map((r) => ({ value: r.id, label: r.name }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }

  const parentMap = new Map<string, string>();
  for (const raw of items) {
    const o = asRecord(raw);
    const pc = asRecord(o?.parentCompany);
    if (pc?.id) {
      const pid = String(pc.id).trim();
      if (pid) parentMap.set(pid, String(pc.name ?? pid).trim() || pid);
    }
  }
  for (const r of rows) {
    if (r.parentCompanyId && !parentMap.has(r.parentCompanyId)) {
      const pRow = byId.get(r.parentCompanyId);
      parentMap.set(r.parentCompanyId, pRow?.name ?? r.parentCompanyId);
    }
  }
  return Array.from(parentMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

/**
 * Child companies under a parent for `GET /companies/by-reseller/:id?view=tree`
 * (`data.items[].parentCompanies[].childCompanies[]`).
 */
export function extractChildCompanyOptionsForParentFromByResellerTree(
  payload: unknown,
  parentCompanyId: string,
): { value: string; label: string }[] {
  const pid = parentCompanyId.trim();
  if (!pid) return [];
  const items = pickItemsArray(payload);
  const byId = new Map<string, { value: string; label: string }>();
  for (const raw of items) {
    const item = asRecord(raw);
    if (!item) continue;
    const parents = Array.isArray(item.parentCompanies)
      ? (item.parentCompanies as unknown[])
      : [];
    for (const pRaw of parents) {
      const p = asRecord(pRaw);
      if (!p) continue;
      const pId = String(p.id ?? "").trim();
      if (!pId || pId !== pid) continue;
      const children = Array.isArray(p.childCompanies)
        ? (p.childCompanies as unknown[])
        : [];
      for (const cRaw of children) {
        const c = asRecord(cRaw);
        if (!c) continue;
        const id = String(c.id ?? "").trim();
        if (!id) continue;
        const label = String(c.name ?? "").trim() || id;
        byId.set(id, { value: id, label });
      }
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
}
