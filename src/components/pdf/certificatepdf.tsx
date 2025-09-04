import { Document, Page, Text, View } from "@react-pdf/renderer"
import { styles } from "./Stylesheet"
import { format } from "date-fns"
import PDFHeader from "./pdfheader"


type Props = {
  filter: string
  certificates: Certificate[]
}
type Certificate = {
  id: number;
  amount?: string;
  resident_name: any;
  name: string;
  type_: string;
  issued_date: Date;
  purpose?: string;
};

export const CertificatePDF = ({ filter, certificates }: Props) => {
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
              <View style={styles.headerCell}><Text>Name</Text></View>
              <View style={styles.headerCell}><Text>Purpose</Text></View>
              <View style={styles.headerCell}><Text>Amount</Text></View>
              <View style={styles.headerCell}><Text>Issued Date</Text></View>
              <View style={styles.headerCell}><Text>Expires On</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
            </View>

            <View style={styles.table}>
              {certificates.map((cert, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={cert.id}
                >
                  <View style={styles.tableCell}><Text>{cert.id?.toString() ?? ""}</Text></View>
                  <View style={styles.tableCell}><Text>{cert.name}</Text></View>
                  <View style={styles.tableCell}><Text>{cert.purpose ?? ""}</Text></View>
                  <View style={styles.tableCell}><Text>{cert.amount?.toString() ?? ""}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{cert.issued_date ? format(new Date(cert.issued_date), "MMMM do, yyyy") : ""}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>
                      {cert.issued_date
                        ? format(
                            new Date(new Date(cert.issued_date).setFullYear(new Date(cert.issued_date).getFullYear() + 1)),
                            "MMMM do, yyyy"
                          )
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>
                      {cert.issued_date &&
                      new Date() > new Date(new Date(cert.issued_date).setFullYear(new Date(cert.issued_date).getFullYear() + 1))
                        ? "Expired"
                        : "Active"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}