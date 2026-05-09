import type { AdminWidgetTableRow } from "@/api/types/widgets.types";
import type { JsonRecord } from "@/api/types/common.types";

export function parseWidgetListData(data: unknown): {
  items: JsonRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  const d =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? (data as JsonRecord)
      : {};

  let items: unknown[] = [];
  if (Array.isArray(data)) items = data;
  else if (Array.isArray(d.items)) items = d.items;
  else if (Array.isArray(d.records)) items = d.records;

  const total =
    typeof d.total === "number" ? d.total : Array.isArray(items) ? items.length : 0;
  const page = typeof d.page === "number" && d.page >= 1 ? d.page : 1;
  const limit =
    typeof d.limit === "number" && d.limit > 0 ? d.limit : Math.max(items.length, 1);
  const totalPages =
    typeof d.totalPages === "number"
      ? Math.max(1, d.totalPages)
      : Math.max(1, Math.ceil(total / limit));

  return {
    items: items as JsonRecord[],
    page,
    limit,
    total,
    totalPages,
  };
}

export function mapAdminWidgetToTableRow(item: JsonRecord): AdminWidgetTableRow {
  const widgetKey = String(item.widgetKey ?? item.widget_key ?? "");
  const id = widgetKey || String(item.id ?? "");

  const websiteId = String(item.websiteId ?? "");
  const websiteObj = item.website as JsonRecord | undefined;
  const websiteLabel =
    typeof websiteObj?.hostname === "string"
      ? websiteObj.hostname
      : typeof websiteObj?.url === "string"
        ? websiteObj.url
        : typeof item.websiteHostname === "string"
          ? item.websiteHostname
          : typeof item.websiteUrl === "string"
            ? item.websiteUrl
            : typeof item.websiteName === "string"
              ? item.websiteName
              : websiteId || "—";

  const wt = String(item.widgetType ?? "CHAT").toUpperCase();
  let widgetTypeLabel = "Chat";
  if (wt === "TEXT_US") widgetTypeLabel = "Text Us";
  else if (wt === "BOTH") widgetTypeLabel = "Chat + Text";

  const surfaces = item.surfaces as JsonRecord | undefined;
  const chatEnabled = surfaces?.chatEnabled !== false;
  const textUsEnabled = surfaces?.textUsEnabled !== false;

  const published =
    item.publishedVersionNo ?? item.activeVersionNo ?? item.versionNo ?? null;
  const statusRaw = String(item.status ?? item.widgetStatus ?? "").toLowerCase();
  const statusLabel =
    published != null && published !== ""
      ? "Published"
      : statusRaw.includes("draft")
        ? "Draft"
        : statusRaw
          ? statusRaw
          : "—";

  return {
    id,
    widgetKey: widgetKey || id,
    websiteId,
    websiteLabel,
    parentCompany: String(
      item.parentCompanyName ?? item.parentCompany ?? item.parentCompanyTitle ?? "—",
    ),
    childCompany: String(
      item.childCompanyName ?? item.childCompany ?? item.childCompanyTitle ?? "—",
    ),
    resellerName: String(
      item.resellerName ?? item.clientName ?? item.resellerTitle ?? "—",
    ),
    widgetTypeLabel,
    publishedVersionNo:
      published !== undefined && published !== null && published !== ""
        ? String(published)
        : "—",
    chatEnabled,
    textUsEnabled,
    statusLabel,
    raw: item,
  };
}
