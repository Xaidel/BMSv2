

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";

type Resident = {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  civil_status: string;
  gender: string;
  date_of_birth: Date;
  zone: string;
  status: string;
};

type Props = {
  filter: string;
  residents: Resident[];
};

export const ResidentPDF = ({ filter, residents }: Props) => {
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
                  key={resident.id}
                >
                  <View style={styles.tableCell}><Text>{resident.id}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>
                      {resident.first_name} {resident.middle_name ?? ""} {resident.last_name}
                    </Text>
                  </View>
                  <View style={styles.tableCell}><Text>{resident.civil_status}</Text></View>
                  <View style={styles.tableCell}><Text>{resident.gender}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{format(new Date(resident.date_of_birth), "MMMM do, yyyy")}</Text>
                  </View>
                  <View style={styles.tableCell}><Text>{resident.zone}</Text></View>
                  <View style={styles.tableCell}><Text>{resident.status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};