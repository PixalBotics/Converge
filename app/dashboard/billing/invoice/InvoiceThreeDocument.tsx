"use client";

import Box from "@mui/material/Box";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { logoSvg } from "@/assets";
import {
  invoiceThreeBodySx,
  invoiceThreeFooterItemSx,
  invoiceThreeFooterPillSx,
  invoiceThreeFooterSx,
  invoiceThreeGrandTotalSx,
  invoiceThreeHeaderCircleArcSx,
  invoiceThreeHeaderCircleSx,
  invoiceThreeHeaderContentSx,
  invoiceThreeHeaderSx,
  invoiceThreeLogoImgSx,
  invoiceThreeMetaSx,
  invoiceThreeNotesBodySx,
  invoiceThreeNotesSx,
  invoiceThreeNotesTitleSx,
  invoiceThreePaperSx,
  invoiceThreePayableBlockSx,
  invoiceThreeSectionBodySx,
  invoiceThreeSectionTitleSx,
  invoiceThreeSummaryRowSx,
  invoiceThreeTableHeaderBarSx,
  invoiceThreeTableRowSx,
  invoiceThreeTitleBlockSx,
  invoiceThreeTitleSx,
  invoiceThreeTotalLineSx,
  invoiceThreeTotalsSx,
} from "./invoice-three.styles";

const LINE_ITEMS = [
  { description: "Ski Essentials Package", qty: 2, price: "$40.00", total: "$80.00" },
  { description: "Rental pickup", qty: 1, price: "$10.00", total: "$10.00" },
  { description: "Additional Ski Rental", qty: 2, price: "$5.00", total: "$10.00" },
  { description: "Boots Rental", qty: 2, price: "$4.00", total: "$8.00" },
  { description: "Poles Rental", qty: 2, price: "$4.00", total: "$8.00" },
];

export function InvoiceThreeDocument() {
  return (
    <Box sx={invoiceThreePaperSx} component="article">
      <Box sx={invoiceThreeHeaderSx}>
        <Box sx={invoiceThreeHeaderCircleSx} aria-hidden />
        <Box sx={invoiceThreeHeaderCircleArcSx} aria-hidden />

        <Box sx={invoiceThreeHeaderContentSx}>
          <Box
            component="img"
            src={logoSvg}
            alt="Interchanges"
            sx={invoiceThreeLogoImgSx}
          />
          <Box sx={invoiceThreeTitleBlockSx}>
            <Box sx={invoiceThreeTitleSx}>INVOICE</Box>
            <Box sx={invoiceThreeMetaSx}>Number: 01234</Box>
            <Box sx={invoiceThreeMetaSx}>Date: 31/10/2023</Box>
          </Box>
        </Box>
      </Box>

      <Box sx={invoiceThreeBodySx}>
        <Box sx={invoiceThreePayableBlockSx}>
          <Box sx={invoiceThreeSectionTitleSx}>Payable To</Box>
          <Box sx={invoiceThreeSectionBodySx}>
            Mr. Howard Ong
            <br />
            123 Anywhere St., Any City
          </Box>

          <Box sx={invoiceThreeSectionTitleSx}>Bank Details</Box>
          <Box sx={{ ...invoiceThreeSectionBodySx, mb: 0 }}>
            Salford &amp; Co.
            <br />
            0123 4567 8901 2345
          </Box>
        </Box>

        <Box aria-label="Invoice line items">
          <Box sx={invoiceThreeTableHeaderBarSx}>
            <span>Item Description</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </Box>
          {LINE_ITEMS.map((row) => (
            <Box key={row.description} sx={invoiceThreeTableRowSx}>
              <span>{row.description}</span>
              <span>{row.qty}</span>
              <span>{row.price}</span>
              <span>{row.total}</span>
            </Box>
          ))}
        </Box>

        <Box sx={invoiceThreeSummaryRowSx}>
          <Box sx={invoiceThreeNotesSx}>
            <Box sx={invoiceThreeNotesTitleSx}>Notes:</Box>
            <Box sx={invoiceThreeNotesBodySx}>
              We appreciate your business and your trust in our services. Should you have any
              questions regarding this invoice, please contact us. Thank you for choosing our
              team.
            </Box>
          </Box>
          <Box sx={invoiceThreeTotalsSx}>
            <Box sx={invoiceThreeTotalLineSx}>
              <span>Sub Total</span>
              <span>$ 116.00</span>
            </Box>
            <Box sx={invoiceThreeTotalLineSx}>
              <span>Tax (10%)</span>
              <span>$ 16.00</span>
            </Box>
            <Box sx={invoiceThreeGrandTotalSx}>
              <span>Grand Total</span>
              <span>$ 132.00</span>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={invoiceThreeFooterSx}>
        <Box sx={invoiceThreeFooterPillSx}>
          <Box sx={invoiceThreeFooterItemSx}>
            <LanguageOutlinedIcon sx={{ fontSize: 18 }} />
            reallygreatsite.com
          </Box>
          <Box sx={invoiceThreeFooterItemSx}>
            <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
            123-456-7890
          </Box>
          <Box sx={invoiceThreeFooterItemSx}>
            <EmailOutlinedIcon sx={{ fontSize: 18 }} />
            hello@reallygreatsite.com
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
