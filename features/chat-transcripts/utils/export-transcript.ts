import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import type { ChatMessage, ChatParticipantRole } from "@/services/chat/chat.types";

export type TranscriptExportMeta = {
  title: string;
  conversationId: string;
  agent?: string;
  website?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  reseller?: string;
  parentCompany?: string;
  childCompany?: string;
};

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) =>
    (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
  );
}

function roleSenderLabel(role: ChatParticipantRole): string {
  switch (role) {
    case "visitor":
      return "Visitor";
    case "agent":
      return "Agent";
    case "ai":
      return "AI";
    case "system":
      return "System";
    default:
      return role;
  }
}

export function messageSenderLabel(msg: ChatMessage): string {
  if (msg.senderName?.trim()) return msg.senderName.trim();
  return roleSenderLabel(msg.role);
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function safeFilenameBase(title: string): string {
  const base = title
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return base.slice(0, 40) || "transcript";
}

export function transcriptExportFilename(
  meta: TranscriptExportMeta,
  ext: "xlsx" | "docx",
): string {
  return `${safeFilenameBase(meta.title)}_${meta.conversationId.slice(0, 8)}.${ext}`;
}

function summaryRows(meta: TranscriptExportMeta): Array<{ Field: string; Value: string }> {
  const rows: Array<{ Field: string; Value: string }> = [
    { Field: "Conversation", Value: meta.title },
    { Field: "Chat ID", Value: meta.conversationId },
  ];
  if (meta.agent) rows.push({ Field: "Agent", Value: meta.agent });
  if (meta.website) rows.push({ Field: "Website", Value: meta.website });
  if (meta.status) rows.push({ Field: "Status", Value: meta.status });
  if (meta.startedAt) rows.push({ Field: "Started", Value: formatTimestamp(meta.startedAt) });
  if (meta.endedAt) rows.push({ Field: "Ended", Value: formatTimestamp(meta.endedAt) });
  if (meta.reseller) rows.push({ Field: "Reseller", Value: meta.reseller });
  if (meta.parentCompany) rows.push({ Field: "Parent company", Value: meta.parentCompany });
  if (meta.childCompany) rows.push({ Field: "Child company", Value: meta.childCompany });
  rows.push({ Field: "Exported", Value: new Date().toLocaleString() });
  return rows;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTranscriptXlsx(
  messages: ChatMessage[],
  meta: TranscriptExportMeta,
): void {
  const sorted = sortMessages(messages);
  const messageRows = sorted.map((m) => ({
    Timestamp: formatTimestamp(m.createdAt),
    Sender: messageSenderLabel(m),
    Role: roleSenderLabel(m.role),
    Message: m.content,
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(messageRows),
    "Messages",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(summaryRows(meta)),
    "Summary",
  );

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(blob, transcriptExportFilename(meta, "xlsx"));
}

function summaryTableRows(meta: TranscriptExportMeta): TableRow[] {
  return summaryRows(meta).map(
    (row) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: row.Field, bold: true })] })],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [new Paragraph(row.Value)],
          }),
        ],
      }),
  );
}

export async function downloadTranscriptDocx(
  messages: ChatMessage[],
  meta: TranscriptExportMeta,
): Promise<void> {
  const sorted = sortMessages(messages).filter((m) => m.content.trim().length > 0);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: meta.title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: summaryTableRows(meta),
          }),
          new Paragraph({
            text: "Chat transcript",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          ...sorted.map(
            (m) =>
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: `[${formatTimestamp(m.createdAt)}] `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `${messageSenderLabel(m)}: `,
                    bold: true,
                  }),
                  new TextRun({ text: m.content }),
                ],
              }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, transcriptExportFilename(meta, "docx"));
}
