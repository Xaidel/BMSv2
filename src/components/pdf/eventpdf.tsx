import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { Event } from "@/types/apitypes";

type Props = {
  filter: string;
  events: Event[];
};

export const EventPDF = ({ filter, events }: Props) => {
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
              <View style={styles.headerCell}><Text>Name</Text></View>
              <View style={styles.headerCell}><Text>Type</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
              <View style={styles.headerCell}><Text>Date</Text></View>
              <View style={styles.headerCell}><Text>Venue</Text></View>
              <View style={styles.headerCell}><Text>Attendee</Text></View>
              <View style={styles.headerCell}><Text>Notes</Text></View>
            </View>
            <View style={styles.table}>
              {events.map((event, index) => (
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
                  <View style={styles.tableCell}><Text>{format(event.Date, "MMMM do, yyyy")}</Text></View>
                  <View style={styles.tableCell}><Text>{event.Venue}</Text></View>
                  <View style={styles.tableCell}><Text>{event.Audience}</Text></View>
                  <View style={styles.tableCell}><Text>{event.Notes}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};