

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";

type Event = {
  id: number;
  name: string;
  type_: string;
  status: "Upcoming" | "Finished" | "Ongoing" | "Cancelled";
  date: Date;
  venue: string;
  attendee: string;
  notes: string;
};

type Props = {
  filter: string;
  events: Event[];
};

export const EventPDF = ({ filter, events }: Props) => {
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
                  key={event.id}
                >
                  <View style={styles.tableCell}><Text>{event.id}</Text></View>
                  <View style={styles.tableCell}><Text>{event.name}</Text></View>
                  <View style={styles.tableCell}><Text>{event.type_}</Text></View>
                  <View style={styles.tableCell}><Text>{event.status}</Text></View>
                  <View style={styles.tableCell}><Text>{format(event.date, "MMMM do, yyyy")}</Text></View>
                  <View style={styles.tableCell}><Text>{event.venue}</Text></View>
                  <View style={styles.tableCell}><Text>{event.attendee}</Text></View>
                  <View style={styles.tableCell}><Text>{event.notes}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};