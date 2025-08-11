

import { Expense } from "@/types/types";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";

type Props = {
  filter: string;
  expenses: Expense[];
};

export const ExpensePDF = ({ filter, expenses }: Props) => {
  return (
    <Document>
      <Page orientation="landscape" size="A4" wrap={false}>
        <View style={{ margin: "20px" }}>
          <View style={styles.header}>
            <Text>Republic of the Philippines</Text>
            <Text>Province of Camarines Sur</Text>
            <Text>Municipality of Pamplona</Text>
          </View>
          <View style={{ margin: "40px" }}>
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
              {expenses.map((expense, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={expense.id}
                >
                  <View style={styles.tableCell}><Text>{expense.id}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.type_}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.category}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.or_number}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.amount.toFixed(2)}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.paid_to}</Text></View>
                  <View style={styles.tableCell}><Text>{expense.paid_by}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{format(expense.date, "MMMM do, yyyy")}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};