import { isRecord, unwrapApiData } from "@/lib/utils";
import type { KnowledgeHit } from "@/services/chat/chatAi.types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x).trim()).filter(Boolean);
}

/** Parse suggested replies: `suggestions` | `replies` | `items[].text` */
export function parseSuggestedReplies(raw: unknown): string[] {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : null;
  if (!o) return [];
  const direct = o["suggestions"] ?? o["replies"] ?? o["candidates"];
  const fromArr = asStringArray(direct);
  if (fromArr.length) return fromArr;
  const items = o["items"];
  if (Array.isArray(items)) {
    return items
      .map((it) => {
        if (typeof it === "string") return it.trim();
        if (isRecord(it)) return String(it["text"] ?? it["content"] ?? "").trim();
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

export function parseSummaryText(raw: unknown): string {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : null;
  if (!o) return "";
  const t = o["summary"] ?? o["text"] ?? o["content"] ?? o["result"];
  if (typeof t === "string") return t.trim();
  return "";
}

export function parseRewriteText(raw: unknown): string {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : null;
  if (!o) return "";
  const t = o["text"] ?? o["rewritten"] ?? o["content"] ?? o["result"];
  if (typeof t === "string") return t.trim();
  return "";
}

export function parseKnowledgeHits(raw: unknown): KnowledgeHit[] {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : null;
  const arr = o ? (o["hits"] ?? o["results"] ?? o["documents"]) : null;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item): KnowledgeHit | null => {
      if (typeof item === "string") return { title: "Result", snippet: item };
      if (!isRecord(item)) return null;
      const title = String(item["title"] ?? item["name"] ?? "Hit").trim() || "Hit";
      const snippet = String(item["snippet"] ?? item["content"] ?? item["text"] ?? "").trim();
      const url = typeof item["url"] === "string" ? item["url"] : undefined;
      const score = typeof item["score"] === "number" ? item["score"] : undefined;
      return { title, snippet, url, score };
    })
    .filter((x): x is KnowledgeHit => x !== null && Boolean(x.snippet || x.title));
}
