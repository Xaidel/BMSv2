import { Expense } from "@/types/apitypes";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  expenses: Expense[];
};

const ROWS_PER_PAGE = 10;

export const ExpensePDF = ({ filter, expenses }: Props) => {
  // Split expenses into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < expenses.length; i += ROWS_PER_PAGE) {
    pages.push(expenses.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageExpenses, pageIndex) => (
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
                <View style={styles.headerCell}><Text>Disbursement Voucher</Text></View>
                <View style={styles.headerCell}><Text>Amount</Text></View>
                <View style={styles.headerCell}><Text>Paid To</Text></View>
                <View style={styles.headerCell}><Text>Paid By</Text></View>
                <View style={styles.headerCell}><Text>Date Issued</Text></View>
              </View>
              <View style={styles.table}>
                {pageExpenses.map((expense, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={expense.ID}
                  >
                    <View style={styles.tableCell}><Text>{expense.ID}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.Type}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.Category}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.OR}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.Amount.toFixed(2)}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.PaidTo}</Text></View>
                    <View style={styles.tableCell}><Text>{expense.PaidBy}</Text></View>
                    <View style={styles.tableCell}>
                      <Text>{format(expense.Date, "MMMM do, yyyy")}</Text>
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