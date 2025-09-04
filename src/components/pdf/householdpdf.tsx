import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Household } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  households: Household[];
};

export const HouseholdPDF = ({ filter, households }: Props) => {
  return (
    <Document>
      <Page orientation="landscape" size="A4" wrap={false}>
        <View style={{ margin: "20px" }}>
          <PDFHeader/>
          <View style={{ margin: "40px" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>{filter}</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.headerCell}><Text>ID</Text></View>
              <View style={styles.headerCell}><Text>House #</Text></View>
              <View style={styles.headerCell}><Text>Type</Text></View>
              <View style={styles.headerCell}><Text>Members</Text></View>
              <View style={styles.headerCell}><Text>Head</Text></View>
              <View style={styles.headerCell}><Text>Zone</Text></View>
              <View style={styles.headerCell}><Text>Date</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
            </View>
            <View style={styles.table}>
              {households.map((household, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={household.id}
                >
                  <View style={styles.tableCell}><Text>{household.id}</Text></View>
                  <View style={styles.tableCell}><Text>{household.household_number}</Text></View>
                  <View style={styles.tableCell}><Text>{household.type}</Text></View>
                  <View style={styles.tableCell}><Text>{Array.isArray(household.member) ? household.member.length : household.member}</Text></View>
                  <View style={styles.tableCell}><Text>{household.head}</Text></View>
                  <View style={styles.tableCell}><Text>{household.zone}</Text></View>
                  <View style={styles.tableCell}><Text>{format(household.date, "MMMM do, yyyy")}</Text></View>
                  <View style={styles.tableCell}><Text>{household.status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};