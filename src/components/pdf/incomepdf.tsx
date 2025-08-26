


import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Income } from "@/types/apitypes";

type Props = {
  filter: string;
  incomes: Income[];
};

export const IncomePDF = ({ filter, incomes }: Props) => {
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
              <View style={styles.headerCell}><Text>OR Number</Text></View>
              <View style={styles.headerCell}><Text>Amount</Text></View>
              <View style={styles.headerCell}><Text>Received From</Text></View>
              <View style={styles.headerCell}><Text>Received By</Text></View>
              <View style={styles.headerCell}><Text>Date Issued</Text></View>
            </View>
            <View style={styles.table}>
              {incomes.map((income, index) => (
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
    </Document>
  );
};