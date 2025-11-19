import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { GovDoc } from "@/types/apitypes";

type Props = {
  filter: string;
  govDocs: GovDoc[];
};

const ROWS_PER_PAGE = 10;

export const GovDocsPDF = ({ filter, govDocs }: Props) => {
  // Split docs into pages of 10 rows each
  const pages = [];
  for (let i = 0; i < govDocs.length; i += ROWS_PER_PAGE) {
    pages.push(govDocs.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageDocs, pageIndex) => (
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
                <View style={styles.headerCell}><Text>Title</Text></View>
                <View style={styles.headerCell}><Text>Type</Text></View>
                <View style={styles.headerCell}><Text>Description</Text></View>
                <View style={styles.headerCell}><Text>Date Issued</Text></View>
              </View>
              <View style={styles.table}>
                {pageDocs.map((doc, index) => (
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
      ))}
    </Document>
  );
};