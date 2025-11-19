import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";

const ROWS_PER_PAGE = 10;

type Logbook = {
  ID: number;
  Name: string;
  Date: Date;
  TimeInAm?: string;
  TimeOutAm?: string;
  TimeInPm?: string;
  TimeOutPm?: string;
  Remarks?: string;
  Status?: string;
  TotalHours?: number;
};

type Props = {
  filter: string;
  logbook: Logbook[];
};

export const LogbookPDF = ({ filter, logbook }: Props) => {
  // Split logbook entries into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < logbook.length; i += ROWS_PER_PAGE) {
    pages.push(logbook.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageEntries, pageIndex) => (
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
                <View style={styles.headerCell}><Text>Official ID</Text></View>
                <View style={styles.headerCell}><Text>Date</Text></View>
                <View style={styles.headerCell}><Text>Time In AM</Text></View>
                <View style={styles.headerCell}><Text>Time Out AM</Text></View>
                <View style={styles.headerCell}><Text>Time In PM</Text></View>
                <View style={styles.headerCell}><Text>Time Out PM</Text></View>
                <View style={styles.headerCell}><Text>Remarks</Text></View>
                <View style={styles.headerCell}><Text>Status</Text></View>
                <View style={styles.headerCell}><Text>Total Hours</Text></View>
              </View>
              <View style={styles.table}>
                {pageEntries.map((entry, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={entry.ID}
                  >
                    <View style={styles.tableCell}><Text>{entry.ID}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.Name}</Text></View>
                    <View style={styles.tableCell}><Text>{format(entry.Date, "MMMM do, yyyy")}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.TimeInAm || ""}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.TimeOutAm || ""}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.TimeInPm || ""}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.TimeOutPm || ""}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.Remarks || ""}</Text></View>
                    <View style={styles.tableCell}><Text>{entry.Status || ""}</Text></View>
                    <View style={styles.tableCell}>
                      <Text>
                        {entry.TotalHours !== undefined ? entry.TotalHours.toFixed(2) + " hrs" : ""}
                      </Text>
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