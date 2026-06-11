"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { Typography, Button, FormModal } from "@/components/common";
import { asRecord } from "../utils";
import type { UnknownRecord } from "../types";

export type CompanyParentListModalProps = {
  open: boolean;
  resellerName: string;
  parentRows: UnknownRecord[];
  onClose: () => void;
};

export function CompanyParentListModal({
  open,
  resellerName,
  parentRows,
  onClose,
}: CompanyParentListModalProps) {
  return (
    <FormModal
      open={open}
      title={resellerName ? `${resellerName} – Parent companies` : "Parent companies"}
      description={`This reseller has ${parentRows.length} parent companies. Choose one to open the edit screen.`}
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Close"
      showCancelButton={false}
      fitContent
      maxWidth={520}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {parentRows.map((raw, index) => {
          const p = asRecord(raw) ?? {};
          const id = String(p.id ?? "").trim();
          const name = String(p.name ?? "").trim() || "—";
          const childArr = Array.isArray(p.childCompanies) ? p.childCompanies : [];
          const childN = childArr.length;
          const childNames = childArr
            .map((childRaw) => {
              const child = asRecord(childRaw);
              return String(child?.name ?? "").trim();
            })
            .filter((childName) => childName.length > 0);
          const href =
            id.length > 0 ? `/dashboard/companies/${encodeURIComponent(id)}/edit?step=1` : "";

          return (
            <Box
              key={id || `parent-${index}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                py: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                "&:last-of-type": { borderBottom: "none", pb: 0 },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="mediumLarge" color="white" fontWeight={600}>
                  {name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                  {childN === 0
                    ? "No child companies"
                    : childN === 1
                      ? "1 child company"
                      : `${childN} child companies`}
                </Typography>
                {childNames.length > 0 ? (
                  <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.84)" }}>
                    {childNames.join(", ")}
                  </Typography>
                ) : null}
              </Box>
              {href ? (
                <Button component={Link} href={href} variant="primary" size="small" sx={{ flexShrink: 0 }}>
                  Edit
                </Button>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </FormModal>
  );
}
