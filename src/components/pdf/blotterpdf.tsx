import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Blotter } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  blotters: Blotter[];
};

export const BlotterPDF = ({ filter, blotters }: Props) => {
  return (
    <Document>
      <Page orientation="landscape" size="A4" wrap style={{ paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10 }}>
        <View style={{ margin: "2px" }}>
          <PDFHeader />
          <View style={{ margin: "0px" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>{filter}</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.headerCell}><Text>ID</Text></View>
              <View style={styles.headerCell}><Text>Type</Text></View>
              <View style={styles.headerCell}><Text>Reported By</Text></View>
              <View style={styles.headerCell}><Text>Involved</Text></View>
              <View style={styles.headerCell}><Text>Date</Text></View>
              <View style={styles.headerCell}><Text>Location</Text></View>
              <View style={styles.headerCell}><Text>Zone</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
            </View>
            <View style={styles.table}>
              {blotters.map((blotter, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={blotter.ID}
                >
                  <View style={styles.tableCell}><Text>{blotter.ID}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.Type}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.ReportedBy}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.Involved}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{format(new Date(blotter.IncidentDate), "MMMM do, yyyy")}</Text>
                  </View>
                  <View style={styles.tableCell}><Text>{`Brgy. ${blotter.Location}`}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.Zone}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.Status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};