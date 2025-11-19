import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { Event } from "@/types/apitypes";

type Props = {
  filter: string;
  events: Event[];
};

const ROWS_PER_PAGE = 10;

export const EventPDF = ({ filter, events }: Props) => {
  // Split events into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < events.length; i += ROWS_PER_PAGE) {
    pages.push(events.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageEvents, pageIndex) => (
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
                <View style={styles.headerCell}><Text>Name</Text></View>
                <View style={styles.headerCell}><Text>Type</Text></View>
                <View style={styles.headerCell}><Text>Status</Text></View>
                <View style={styles.headerCell}><Text>Date</Text></View>
                <View style={styles.headerCell}><Text>Venue</Text></View>
                <View style={styles.headerCell}><Text>Attendee</Text></View>
                <View style={styles.headerCell}><Text>Notes</Text></View>
              </View>
              <View style={styles.table}>
                {pageEvents.map((event, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={event.ID}
                  >
                    <View style={styles.tableCell}><Text>{event.ID}</Text></View>
                    <View style={styles.tableCell}><Text>{event.Name}</Text></View>
                    <View style={styles.tableCell}><Text>{event.Type}</Text></View>
                    <View style={styles.tableCell}><Text>{event.Status}</Text></View>
                    <View style={styles.tableCell}>
                      <Text>{format(event.Date, "MMMM do, yyyy")}</Text>
                    </View>
                    <View style={styles.tableCell}><Text>{event.Venue}</Text></View>
                    <View style={styles.tableCell}><Text>{event.Audience}</Text></View>
                    <View style={styles.tableCell}><Text>{event.Notes}</Text></View>
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