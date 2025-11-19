import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { Household } from "@/types/apitypes";

type Props = {
  filter: string;
  households: Household[];
};

const ROWS_PER_PAGE = 10;

export const HouseholdPDF = ({ filter, households }: Props) => {
  // Split households into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < households.length; i += ROWS_PER_PAGE) {
    pages.push(households.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageHouseholds, pageIndex) => (
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
                <View style={styles.headerCell}><Text>House #</Text></View>
                <View style={styles.headerCell}><Text>Type</Text></View>
                <View style={styles.headerCell}><Text>Members</Text></View>
                <View style={styles.headerCell}><Text>Head</Text></View>
                <View style={styles.headerCell}><Text>Zone</Text></View>
                <View style={styles.headerCell}><Text>Date</Text></View>
                <View style={styles.headerCell}><Text>Status</Text></View>
              </View>

              <View style={styles.table}>
                {pageHouseholds.map((household, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={household.id}
                  >
                    <View style={styles.tableCell}>
                      <Text>{household.id}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{household.household_number}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{household.type}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{Array.isArray(household.member) ? household.member.length : household.member}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{household.head}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{household.zone}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{format(household.date, "MMMM do, yyyy")}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{household.status}</Text>
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