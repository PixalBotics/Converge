"use client";

import Box from "@mui/material/Box";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { logoSvg } from "@/assets";
import {
  INVOICE_BLUE,
  invoiceOneBottomRowSx,
  invoiceOneBrandRowSx,
  invoiceOneDividerSx,
  invoiceOneFooterContactsSx,
  invoiceOneFooterDividerSx,
  invoiceOneFooterItemSx,
  invoiceOneGrandTotalBarSx,
  invoiceOneHeaderRowSx,
  invoiceOneLogoImgSx,
  invoiceOneMetaDetailSx,
  invoiceOneMetaLabelSx,
  invoiceOneMetaNameSx,
  invoiceOneMetaRightSx,
  invoiceOneMetaRowSx,
  invoiceOnePaperSx,
  invoiceOnePaymentLabelBarSx,
  invoiceOneSignatureBlockSx,
  invoiceOneSignatureNameSx,
  invoiceOneSignatureRoleSx,
  invoiceOneSignatureScriptSx,
  invoiceOneSiteSx,
  invoiceOneSubtotalRowSx,
  invoiceOneTableSx,
  invoiceOneTermsBodySx,
  invoiceOneTermsTitleSx,
  invoiceOneThankYouSx,
  invoiceOneTitleSx,
  invoiceOneTotalsInnerSx,
  invoiceOneTotalsWrapSx,
} from "./invoice-one.styles";

const LINE_ITEMS = Array.from({ length: 8 }, (_, i) => ({
  no: i + 1,
  description: "Monthly Account Subscription Fee",
  qty: 1,
  price: "$850",
  total: "$850",
}));

export function InvoiceOneDocument() {
  return (
    <Box sx={invoiceOnePaperSx} component="article">
      <Box sx={invoiceOneHeaderRowSx}>
        <Box sx={invoiceOneBrandRowSx}>
          <Box component="img" src={logoSvg} alt="Interchanges" sx={invoiceOneLogoImgSx} />
        </Box>
        <Box>
          <Box sx={invoiceOneTitleSx}>INVOICE</Box>
          <Box sx={invoiceOneSiteSx}>REALLYGREATSITE.COM</Box>
        </Box>
      </Box>

      <Box component="hr" sx={invoiceOneDividerSx} />

      <Box sx={invoiceOneMetaRowSx}>
        <Box>
          <Box sx={invoiceOneMetaLabelSx}>Invoice to :</Box>
          <Box sx={invoiceOneMetaNameSx}>Ketut Susilo</Box>
          <Box sx={invoiceOneMetaDetailSx}>+62 123-456-7890</Box>
          <Box sx={invoiceOneMetaDetailSx}>hello@reallygreatsite.com</Box>
          <Box sx={invoiceOneMetaDetailSx}>123 Anywhere St., Any City</Box>
        </Box>
        <Box sx={invoiceOneMetaRightSx}>
          <Box sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>Invoice no : 12345</Box>
          <Box sx={invoiceOneMetaDetailSx}>25 June 2022</Box>
        </Box>
      </Box>

      <Box component="table" sx={invoiceOneTableSx} aria-label="Invoice line items">
        <thead>
          <tr>
            <th style={{ width: "8%" }}>NO</th>
            <th style={{ width: "44%" }}>DESCRIPTION</th>
            <th style={{ width: "12%" }}>QTY</th>
            <th style={{ width: "18%" }}>PRICE</th>
            <th style={{ width: "18%" }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {LINE_ITEMS.map((row) => (
            <tr key={row.no}>
              <td>{row.no}</td>
              <td>{row.description}</td>
              <td>{row.qty}</td>
              <td>{row.price}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Box sx={invoiceOneTotalsWrapSx}>
        <Box sx={invoiceOneTotalsInnerSx}>
          <Box sx={invoiceOneSubtotalRowSx}>
            <span>Sub Total :</span>
            <span>$7,650</span>
          </Box>
          <Box sx={invoiceOneSubtotalRowSx}>
            <span>Tax 15% :</span>
            <span>$1,148</span>
          </Box>
          <Box sx={invoiceOneGrandTotalBarSx}>
            <span>GRAND TOTAL :</span>
            <span>$8,798</span>
          </Box>
        </Box>
      </Box>

      <Box sx={invoiceOneBottomRowSx}>
        <Box>
          <Box sx={invoiceOnePaymentLabelBarSx}>PAYMENT METHOD :</Box>
          <Box sx={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.7 }}>
            <Box>Bank Name : Borcelle</Box>
            <Box>Account Number : 123-456-7890</Box>
          </Box>
          <Box sx={invoiceOneThankYouSx}>Thank you for business with us!</Box>
          <Box sx={invoiceOneTermsTitleSx}>Term and Conditions :</Box>
          <Box sx={invoiceOneTermsBodySx}>
            Payment is due within 15 days of the invoice date. Late payments may incur a 1.5%
            monthly interest charge on the outstanding balance.
          </Box>
        </Box>
        <Box sx={invoiceOneSignatureBlockSx}>
          <Box sx={invoiceOneSignatureScriptSx}>Henrietta Mitchell</Box>
          <Box sx={invoiceOneSignatureNameSx}>Henrietta Mitchell</Box>
          <Box sx={invoiceOneSignatureRoleSx}>Administrator</Box>
        </Box>
      </Box>

      <Box component="hr" sx={invoiceOneFooterDividerSx} />

      <Box sx={invoiceOneFooterContactsSx}>
        <Box sx={invoiceOneFooterItemSx}>
          <PhoneOutlinedIcon sx={{ fontSize: 18, color: INVOICE_BLUE }} />
          123-456-7890
        </Box>
        <Box sx={invoiceOneFooterItemSx}>
          <EmailOutlinedIcon sx={{ fontSize: 18, color: INVOICE_BLUE }} />
          hello@reallygreatsite.com
        </Box>
        <Box sx={invoiceOneFooterItemSx}>
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: INVOICE_BLUE }} />
          123 Anywhere St., Any City
        </Box>
      </Box>
    </Box>
  );
}
