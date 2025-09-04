import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Resident } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  residents: Resident[];
};

export const ResidentPDF = ({ filter, residents }: Props) => {
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
              <View style={styles.headerCell}><Text>Full Name</Text></View>
              <View style={styles.headerCell}><Text>Civil Status</Text></View>
              <View style={styles.headerCell}><Text>Gender</Text></View>
              <View style={styles.headerCell}><Text>Birthday</Text></View>
              <View style={styles.headerCell}><Text>Zone</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
            </View>
            <View style={styles.table}>
              {residents.map((resident, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={resident.ID}
                >
                  <View style={styles.tableCell}><Text>{resident.ID}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>
                      {resident.Firstname} {resident.Middlename ?? ""} {resident.Lastname} {resident.Suffix ?? ""}
                    </Text>
                  </View>
                  <View style={styles.tableCell}><Text>{resident.CivilStatus}</Text></View>
                  <View style={styles.tableCell}><Text>{resident.Gender}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{format(new Date(resident.Birthday), "MMMM do, yyyy")}</Text>
                  </View>
                  <View style={styles.tableCell}><Text>{resident.Zone}</Text></View>
                  <View style={styles.tableCell}><Text>{resident.Status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};