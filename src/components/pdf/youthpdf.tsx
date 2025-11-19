import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Youth } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

const ROWS_PER_PAGE = 10;

type Props = {
  filter: string;
  youths: Youth[];
};

export const YouthPDF = ({ filter, youths }: Props) => {
  // Split youths array into pages with ROWS_PER_PAGE rows each
  const pages = [];
  for (let i = 0; i < youths.length; i += ROWS_PER_PAGE) {
    pages.push(youths.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageYouths, pageIndex) => (
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
                <View style={styles.headerCell}><Text>Full Name</Text></View>
                <View style={styles.headerCell}><Text>Gender</Text></View>
                <View style={styles.headerCell}><Text>Birthday</Text></View>
                <View style={styles.headerCell}><Text>Email</Text></View>
                <View style={styles.headerCell}><Text>Contact</Text></View>
                <View style={styles.headerCell}><Text>Education</Text></View>
                <View style={styles.headerCell}><Text>Work Status</Text></View>
                <View style={styles.headerCell}><Text>Youth Classification</Text></View>
                <View style={styles.headerCell}><Text>SK Voter</Text></View>
              </View>
              <View style={styles.table}>
                {pageYouths.map((youth, index) => {
                  const classifications = [
                    youth.InSchoolYouth ? "In School" : null,
                    youth.OutOfSchoolYouth ? "Out of School" : null,
                    youth.WorkingYouth ? "Working" : null,
                    youth.YouthWithSpecificNeeds ? "With Specific Needs" : null
                  ].filter(Boolean).join(", ");

                  return (
                    <View
                      style={[
                        styles.tableRow,
                        { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                      ]}
                      key={youth.ID}
                    >
                      <View style={styles.tableCell}><Text>{youth.ID}</Text></View>
                      <View style={styles.tableCell}>
                        <Text>
                          {youth.Firstname} {youth.Middlename ?? ""} {youth.Lastname} {youth.Suffix ?? ""}
                        </Text>
                      </View>
                      <View style={styles.tableCell}><Text>{youth.Gender}</Text></View>
                      <View style={styles.tableCell}>
                        <Text>{youth.Birthday ? format(new Date(youth.Birthday), "MMMM do, yyyy") : "N/A"}</Text>
                      </View>
                      <View style={styles.tableCell}><Text>{youth.EmailAddress ?? "N/A"}</Text></View>
                      <View style={styles.tableCell}><Text>{youth.ContactNumber ?? "N/A"}</Text></View>
                      <View style={styles.tableCell}><Text>{youth.EducationalBackground ?? "N/A"}</Text></View>
                      <View style={styles.tableCell}><Text>{youth.WorkStatus ?? "N/A"}</Text></View>
                      <View style={styles.tableCell}><Text>{classifications || "N/A"}</Text></View>
                      <View style={styles.tableCell}><Text>{youth.IsSKVoter ? "Yes" : "No"}</Text></View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};