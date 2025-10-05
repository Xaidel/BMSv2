import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { GovDoc } from "@/types/apitypes";

type Props = {
  filter: string;
  govDocs: GovDoc[];
};

export const GovDocsPDF = ({ filter, govDocs }: Props) => {
  return (
    <Document>
      <Page orientation="landscape" size="A4" wrap={false}>
        <View style={{ margin: "20px" }}>
          <PDFHeader />
          <View style={{ margin: "40px" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>{filter}</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.headerCell}><Text>ID</Text></View>
              <View style={styles.headerCell}><Text>Title</Text></View>
              <View style={styles.headerCell}><Text>Type</Text></View>
              <View style={styles.headerCell}><Text>Description</Text></View>
              <View style={styles.headerCell}><Text>Date Issued</Text></View>
            </View>
            <View style={styles.table}>
              {govDocs.map((doc, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={doc.ID}
                >
                  <View style={styles.tableCell}><Text>{doc.ID}</Text></View>
                  <View style={styles.tableCell}><Text>{doc.Title}</Text></View>
                  <View style={styles.tableCell}><Text>{doc.Type}</Text></View>
                  <View style={styles.tableCell}><Text>{doc.Description}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>
                      {doc.DateIssued
                        ? format(new Date(doc.DateIssued), "MMMM d, yyyy")
                        : ""}
                    </Text>
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