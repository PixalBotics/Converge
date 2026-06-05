"use client";

import Box from "@mui/material/Box";
import { logoSvg } from "@/assets";
import {
  invoiceTwoBodySx,
  invoiceTwoFooterBodySx,
  invoiceTwoGrandTotalBarSx,
  invoiceTwoHeaderRowSx,
  invoiceTwoInfoRowSx,
  invoiceTwoLogoImgSx,
  invoiceTwoMetaLineSx,
  invoiceTwoPaperSx,
  invoiceTwoSectionBodySx,
  invoiceTwoSectionTitleSx,
  invoiceTwoSubtotalBoxSx,
  invoiceTwoSubtotalRowSx,
  invoiceTwoTableSx,
  invoiceTwoTableWrapSx,
  invoiceTwoTermsSx,
  invoiceTwoTitleSx,
  invoiceTwoTotalsBoxSx,
  invoiceTwoTotalsWrapSx,
  invoiceTwoWaveSx,
} from "./invoice-two.styles";

const LINE_ITEMS = [
  { item: 1, description: "Preliminary Design Services", rate: "$5,000", amount: "$5,000" },
  { item: 2, description: "Schematic Design Services", rate: "$7,500", amount: "$7,500" },
  { item: 3, description: "Design Development Services", rate: "$10,000", amount: "$10,000" },
  { item: 4, description: "Construction Documents Services", rate: "$15,000", amount: "$15,000" },
  { item: 5, description: "Bidding and Negotiation Services", rate: "$5,000", amount: "$5,000" },
  { item: 6, description: "Construction Administration Services", rate: "$10,000", amount: "$10,000" },
];

function InvoiceWaveTop() {
  return (
    <Box component="svg" viewBox="0 0 900 100" preserveAspectRatio="none" sx={invoiceTwoWaveSx} aria-hidden>
      <defs>
        <linearGradient id="invoiceTwoWaveTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F2239" />
          <stop offset="45%" stopColor="#1A3A63" />
          <stop offset="100%" stopColor="#254E82" />
        </linearGradient>
      </defs>
      <path
        fill="url(#invoiceTwoWaveTop)"
        d="M0,0 H900 V42 C720,98 520,18 360,52 C200,86 80,72 0,58 Z"
      />
    </Box>
  );
}

function InvoiceWaveBottom() {
  return (
    <Box component="svg" viewBox="0 0 900 90" preserveAspectRatio="none" sx={invoiceTwoWaveSx} aria-hidden>
      <defs>
        <linearGradient id="invoiceTwoWaveBottom" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0F2239" />
          <stop offset="50%" stopColor="#1A3A63" />
          <stop offset="100%" stopColor="#254E82" />
        </linearGradient>
      </defs>
      <path
        fill="url(#invoiceTwoWaveBottom)"
        d="M0,90 H900 V38 C700,0 480,62 300,28 C140,0 40,48 0,62 Z"
      />
    </Box>
  );
}

export function InvoiceTwoDocument() {
  return (
    <Box sx={invoiceTwoPaperSx} component="article">
      <InvoiceWaveTop />

      <Box sx={invoiceTwoBodySx}>
        <Box sx={invoiceTwoHeaderRowSx}>
          <Box>
            <Box sx={invoiceTwoTitleSx}>INVOICE</Box>
            <Box sx={invoiceTwoMetaLineSx}>
              <strong>Invoice Number:</strong> INV-01234
            </Box>
            <Box sx={invoiceTwoMetaLineSx}>
              <strong>Date:</strong> April 22, 2023
            </Box>
          </Box>
          <Box
            component="img"
            src={logoSvg}
            alt="Interchanges"
            sx={invoiceTwoLogoImgSx}
          />
        </Box>

        <Box sx={invoiceTwoInfoRowSx}>
          <Box>
            <Box sx={invoiceTwoSectionTitleSx}>Bill To:</Box>
            <Box sx={invoiceTwoSectionBodySx}>
              Studio Shodwe Architecture
              <br />
              123 Anywhere St.,
              <br />
              Any City, ST 12345
            </Box>
          </Box>
          <Box>
            <Box sx={invoiceTwoSectionTitleSx}>Payment Information:</Box>
            <Box sx={invoiceTwoSectionBodySx}>
              <strong>Bank:</strong> Warner &amp; Spencer
              <br />
              <strong>Name:</strong> Morgan Maxwell
              <br />
              <strong>Account:</strong> 0123 4567 8901
            </Box>
          </Box>
        </Box>

        <Box sx={invoiceTwoTableWrapSx}>
          <Box component="table" sx={invoiceTwoTableSx} aria-label="Invoice line items">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Item</th>
                <th style={{ width: "50%" }}>Description</th>
                <th style={{ width: "20%" }}>Rate</th>
                <th style={{ width: "20%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {LINE_ITEMS.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.description}</td>
                  <td>{row.rate}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        <Box sx={invoiceTwoTotalsWrapSx}>
          <Box sx={invoiceTwoTotalsBoxSx}>
            <Box sx={invoiceTwoSubtotalBoxSx}>
              <Box sx={invoiceTwoSubtotalRowSx}>
                <span>Sub Total:</span>
                <span>$52,500</span>
              </Box>
              <Box sx={invoiceTwoSubtotalRowSx}>
                <span>Sales Tax:</span>
                <span>$3,150</span>
              </Box>
            </Box>
            <Box sx={invoiceTwoGrandTotalBarSx}>
              <span>Total:</span>
              <span>$55,650</span>
            </Box>
          </Box>
        </Box>

        <Box sx={invoiceTwoTermsSx}>
          <strong>Term and Conditions:</strong> Payment is due 30 days from the invoice date.
        </Box>
      </Box>

      <Box sx={invoiceTwoFooterBodySx}>
        <InvoiceWaveBottom />
      </Box>
    </Box>
  );
}
