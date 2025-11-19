import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Income } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  incomes: Income[];
};

const ROWS_PER_PAGE = 10;

export const IncomePDF = ({ filter, incomes }: Props) => {
  // Split incomes into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < incomes.length; i += ROWS_PER_PAGE) {
    pages.push(incomes.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageIncomes, pageIndex) => (
        <Page
          key={pageIndex}
          orientation="portrait"
          size="A4"
          wrap={false}
          style={{ paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10 }}
        >
          <View style={{ margin: 2 }}>
            <PDFHeader />
            <View style={{ margin: 0 }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14 }}>{filter}</Text>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.headerCell}><Text>ID</Text></View>
                <View style={styles.headerCell}><Text>Type</Text></View>
                <View style={styles.headerCell}><Text>Category</Text></View>
                <View style={styles.headerCell}><Text>OR Number</Text></View>
                <View style={styles.headerCell}><Text>Amount</Text></View>
                <View style={styles.headerCell}><Text>Received From</Text></View>
                <View style={styles.headerCell}><Text>Received By</Text></View>
                <View style={styles.headerCell}><Text>Date Issued</Text></View>
              </View>
              <View style={styles.table}>
                {pageIncomes.map((income, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={income.ID}
                  >
                    <View style={styles.tableCell}><Text>{income.ID}</Text></View>
                    <View style={styles.tableCell}><Text>{income.Type}</Text></View>
                    <View style={styles.tableCell}><Text>{income.Category}</Text></View>
                    <View style={styles.tableCell}><Text>{income.OR}</Text></View>
                    <View style={styles.tableCell}><Text>{income.Amount.toFixed(2)}</Text></View>
                    <View style={styles.tableCell}><Text>{income.ReceivedFrom}</Text></View>
                    <View style={styles.tableCell}><Text>{income.ReceivedBy}</Text></View>
                    <View style={styles.tableCell}>
                      <Text>{format(income.DateReceived, "MMMM do, yyyy")}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};