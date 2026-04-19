"use client";

import Box from "@mui/material/Box";
import { Typography, FormModal } from "@/components/common";
import { asRecord } from "../utils";
import type { UnknownRecord } from "../types";

export type CompanyChildListModalProps = {
  open: boolean;
  parentName: string;
  resellerName: string;
  childRows: UnknownRecord[];
  onClose: () => void;
};

export function CompanyChildListModal({
  open,
  parentName,
  resellerName,
  childRows,
  onClose,
}: CompanyChildListModalProps) {
  return (
    <FormModal
      open={open}
      title={parentName ? `${parentName} – Child Companies` : "Child Companies"}
      description={
        resellerName
          ? `Reseller: ${resellerName}. Showing ${childRows.length} child companies.`
          : `Showing ${childRows.length} child companies.`
      }
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Close"
      showCancelButton={false}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          columnGap: 3,
          rowGap: 2.5,
        }}
      >
        {childRows.map((child, index) => {
          const childObj = asRecord(child) ?? {};
          const name = String(childObj.name ?? "").trim() || "-";
          const email = String(childObj.email ?? "").trim() || "-";
          const phone = String(childObj.phone ?? "").trim() || "-";
          const address = String(childObj.address ?? "").trim() || "-";

          return (
            <Box key={String(childObj.id ?? `${name}-${index}`)}>
              <Typography variant="mediumLarge" color="white">
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {address}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </FormModal>
  );
}
