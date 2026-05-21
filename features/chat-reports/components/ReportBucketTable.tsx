"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { ChatReportMetricBucket } from "@/services/chat/reports.types";
import { formatDurationSeconds, formatScore } from "../utils/format-metric";

interface ReportBucketTableProps {
  title: string;
  rows: ChatReportMetricBucket[];
  emptyLabel?: string;
}

export function ReportBucketTable({
  title,
  rows,
  emptyLabel = "No data in this range.",
}: ReportBucketTableProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.cardBg,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Typography fontWeight={700} sx={{ fontSize: 14, px: 2, py: 1.5 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Chats</TableCell>
              <TableCell align="right">FRT</TableCell>
              <TableCell align="right">Queue</TableCell>
              <TableCell align="right">Handle</TableCell>
              <TableCell align="right">QA</TableCell>
              <TableCell align="right">CSAT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {emptyLabel}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.key} hover>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">{row.conversationCount}</TableCell>
                  <TableCell align="right">
                    {formatDurationSeconds(row.avgFirstResponseSeconds)}
                  </TableCell>
                  <TableCell align="right">
                    {formatDurationSeconds(row.avgQueueSeconds)}
                  </TableCell>
                  <TableCell align="right">
                    {formatDurationSeconds(row.avgHandleSeconds)}
                  </TableCell>
                  <TableCell align="right">{formatScore(row.avgQaScore)}</TableCell>
                  <TableCell align="right">{formatScore(row.avgCsatScore)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
