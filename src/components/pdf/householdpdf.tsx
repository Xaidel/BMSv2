

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Household } from "@/types/types";

type Props = {
  filter: string;
  households: Household[];
};

export const HouseholdPDF = ({ filter, households }: Props) => {
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
                  <View style={styles.tableCell}><Text>{household.type_}</Text></View>
                  <View style={styles.tableCell}><Text>{household.members}</Text></View>
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