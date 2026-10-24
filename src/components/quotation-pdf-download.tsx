"use client";

import { useEffect, useState } from "react";

import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type CustomerInformation = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
} | null;

type ExtraCostInformation = {
  id: string;
  costType: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type QuotationPdfData = {
  quotationNumber: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;

  jewelleryDescription: string;
  quantity: number;
  currency: string;

  baseCalculationAmount: number;
  oneOffCostsTotal: number;
  subtotal: number;
  deliveryCost: number;
  total: number;
  depositRequired: number;

  estimatedProductionTime: string | null;
  paymentTerms: string | null;
  notes: string | null;

  customer: CustomerInformation;
  extraCosts: ExtraCostInformation[];
};

type QuotationPdfDownloadProps = {
  data: QuotationPdfData;
};

const colours = {
  amber: "#92400e",
  amberLight: "#fef3c7",
  amberBorder: "#fcd34d",
  stone900: "#1c1917",
  stone700: "#44403c",
  stone500: "#78716c",
  stone300: "#d6d3d1",
  stone100: "#f5f5f4",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colours.stone900,
    backgroundColor: colours.white,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colours.stone300,
    paddingBottom: 20,
  },

  brandName: {
    color: colours.amber,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },

  brandDescription: {
    marginTop: 5,
    color: colours.stone500,
    fontSize: 9,
  },

  brandContact: {
    marginTop: 3,
    color: colours.stone500,
    fontSize: 9,
  },

  quotationTitle: {
    textAlign: "right",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },

  quotationNumber: {
    marginTop: 6,
    textAlign: "right",
    color: colours.amber,
    fontFamily: "Helvetica-Bold",
  },

  status: {
    marginTop: 6,
    textAlign: "right",
    color: colours.stone500,
    fontSize: 9,
    textTransform: "uppercase",
  },

  informationGrid: {
    marginTop: 24,
    flexDirection: "row",
  },

  informationColumn: {
    width: "50%",
    paddingRight: 12,
  },

  informationColumnRight: {
    width: "50%",
    paddingLeft: 12,
  },

  sectionLabel: {
    color: colours.amber,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 7,
  },

  customerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },

  informationText: {
    color: colours.stone700,
    lineHeight: 1.5,
    marginBottom: 2,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  detailLabel: {
    color: colours.stone500,
  },

  detailValue: {
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },

  descriptionBox: {
    borderWidth: 1,
    borderColor: colours.stone300,
    backgroundColor: colours.stone100,
    padding: 12,
    borderRadius: 4,
  },

  description: {
    color: colours.stone700,
    lineHeight: 1.6,
  },

  quantityText: {
    marginTop: 8,
    fontFamily: "Helvetica-Bold",
  },

  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colours.stone300,
    borderRadius: 4,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: colours.stone100,
    borderBottomWidth: 1,
    borderBottomColor: colours.stone300,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colours.stone300,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  descriptionColumn: {
    width: "48%",
    paddingRight: 8,
  },

  quantityColumn: {
    width: "14%",
    textAlign: "center",
  },

  priceColumn: {
    width: "19%",
    textAlign: "right",
  },

  totalColumn: {
    width: "19%",
    textAlign: "right",
  },

  tableHeaderText: {
    color: colours.stone500,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
  },

  totalsContainer: {
    marginTop: 16,
    marginLeft: "auto",
    width: "52%",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  totalLabel: {
    color: colours.stone500,
  },

  totalValue: {
    fontFamily: "Helvetica-Bold",
  },

  grandTotalRow: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colours.amberBorder,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  grandTotalLabel: {
    color: colours.amber,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },

  grandTotalValue: {
    color: colours.amber,
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
  },

  paymentBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colours.amberLight,
    borderWidth: 1,
    borderColor: colours.amberBorder,
    borderRadius: 4,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  paymentRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  paymentLabel: {
    color: colours.stone700,
  },

  paymentValue: {
    color: colours.amber,
    fontFamily: "Helvetica-Bold",
  },

  notesSection: {
    marginTop: 22,
  },

  notesBlock: {
    marginTop: 10,
  },

  notesTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },

  notesText: {
    color: colours.stone700,
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    borderTopWidth: 1,
    borderTopColor: colours.stone300,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    color: colours.stone500,
    fontSize: 8,
  },
});

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 3,
  }).format(value);
}

function QuotationDocument({
  data,
}: {
  data: QuotationPdfData;
}) {
  const outstandingBalance = Math.max(
    0,
    data.total - data.depositRequired,
  );

  return (
    <Document
      title={`Quotation ${data.quotationNumber}`}
      author="Arc & Flame Silver Jewellery"
      subject="Customer quotation"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>ARC & FLAME</Text>

            <Text style={styles.brandDescription}>
              Silver Jewellery
            </Text>

            <Text style={styles.brandContact}>
              @arcandflame_silverjewellery
            </Text>
          </View>

          <View>
            <Text style={styles.quotationTitle}>
              QUOTATION
            </Text>

            <Text style={styles.quotationNumber}>
              {data.quotationNumber}
            </Text>

            <Text style={styles.status}>
              {formatStatus(data.status)}
            </Text>
          </View>
        </View>

        <View style={styles.informationGrid}>
          <View style={styles.informationColumn}>
            <Text style={styles.sectionLabel}>Prepared for</Text>

            <Text style={styles.customerName}>
              {data.customer?.name ?? "Customer"}
            </Text>

            {data.customer?.email && (
              <Text style={styles.informationText}>
                {data.customer.email}
              </Text>
            )}

            {data.customer?.phone && (
              <Text style={styles.informationText}>
                {data.customer.phone}
              </Text>
            )}

            {data.customer?.address && (
              <Text style={styles.informationText}>
                {data.customer.address}
              </Text>
            )}
          </View>

          <View style={styles.informationColumnRight}>
            <Text style={styles.sectionLabel}>
              Quotation information
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Issue date
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(data.issueDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Expiry date
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(data.expiryDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Currency
              </Text>

              <Text style={styles.detailValue}>
                {data.currency}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Jewellery details
          </Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {data.jewelleryDescription}
            </Text>

            <Text style={styles.quantityText}>
              Quantity: {data.quantity}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Price details
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.descriptionColumn,
                  styles.tableHeaderText,
                ]}
              >
                Description
              </Text>

              <Text
                style={[
                  styles.quantityColumn,
                  styles.tableHeaderText,
                ]}
              >
                Qty
              </Text>

              <Text
                style={[
                  styles.priceColumn,
                  styles.tableHeaderText,
                ]}
              >
                Unit price
              </Text>

              <Text
                style={[
                  styles.totalColumn,
                  styles.tableHeaderText,
                ]}
              >
                Amount
              </Text>
            </View>

            <View
              style={
                data.extraCosts.length === 0
                  ? styles.tableRowLast
                  : styles.tableRow
              }
            >
              <Text style={styles.descriptionColumn}>
                {data.jewelleryDescription}
              </Text>

              <Text style={styles.quantityColumn}>
                {data.quantity}
              </Text>

              <Text style={styles.priceColumn}>
                {formatCurrency(
                  data.baseCalculationAmount /
                    Math.max(data.quantity, 1),
                  data.currency,
                )}
              </Text>

              <Text style={styles.totalColumn}>
                {formatCurrency(
                  data.baseCalculationAmount,
                  data.currency,
                )}
              </Text>
            </View>

            {data.extraCosts.map((cost, index) => (
              <View
                key={cost.id}
                style={
                  index === data.extraCosts.length - 1
                    ? styles.tableRowLast
                    : styles.tableRow
                }
              >
                <Text style={styles.descriptionColumn}>
                  {cost.description}
                </Text>

                <Text style={styles.quantityColumn}>
                  {formatQuantity(cost.quantity)}
                </Text>

                <Text style={styles.priceColumn}>
                  {formatCurrency(
                    cost.unitCost,
                    data.currency,
                  )}
                </Text>

                <Text style={styles.totalColumn}>
                  {formatCurrency(
                    cost.totalCost,
                    data.currency,
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Subtotal
              </Text>

              <Text style={styles.totalValue}>
                {formatCurrency(
                  data.subtotal,
                  data.currency,
                )}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Delivery
              </Text>

              <Text style={styles.totalValue}>
                {formatCurrency(
                  data.deliveryCost,
                  data.currency,
                )}
              </Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                Total
              </Text>

              <Text style={styles.grandTotalValue}>
                {formatCurrency(data.total, data.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentBox}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Deposit required
            </Text>

            <Text style={styles.paymentValue}>
              {formatCurrency(
                data.depositRequired,
                data.currency,
              )}
            </Text>
          </View>

          <View style={styles.paymentRowLast}>
            <Text style={styles.paymentLabel}>
              Remaining balance
            </Text>

            <Text style={styles.paymentValue}>
              {formatCurrency(
                outstandingBalance,
                data.currency,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.notesSection}>
          {data.estimatedProductionTime && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>
                Estimated production time
              </Text>

              <Text style={styles.notesText}>
                {data.estimatedProductionTime}
              </Text>
            </View>
          )}

          {data.paymentTerms && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>
                Payment terms
              </Text>

              <Text style={styles.notesText}>
                {data.paymentTerms}
              </Text>
            </View>
          )}

          {data.notes && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>
                Additional notes
              </Text>

              <Text style={styles.notesText}>
                {data.notes}
              </Text>
            </View>
          )}
        </View>

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            Arc & Flame Silver Jewellery
          </Text>

          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export default function QuotationPdfDownload({
  data,
}: QuotationPdfDownloadProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white opacity-60"
      >
        Preparing PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<QuotationDocument data={data} />}
      fileName={`${data.quotationNumber}.pdf`}
      className="block w-full rounded-xl bg-amber-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-800"
    >
      {({ loading, error }) => {
        if (error) {
          return "PDF could not be generated";
        }

        return loading
          ? "Preparing PDF..."
          : "Download PDF";
      }}
    </PDFDownloadLink>
  );
}