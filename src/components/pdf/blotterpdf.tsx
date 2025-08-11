import { Blotter } from "@/types/types"
import { Document, Page, Text, View } from "@react-pdf/renderer"
import { styles } from "./Stylesheet"
import { format } from "date-fns"

type Props = {
  filter: string
  blotters: Blotter[]
}

export const BlotterPDF = ({ filter, blotters }: Props) => {
  return (
    <Document>
      <Page
        orientation="landscape"
        size="A4"
        wrap={false}
      >
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
                  key={blotter.id}
                >
                  <View style={styles.tableCell}><Text>{blotter.id}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.type_}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.reported_by}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.involved}</Text></View>
                  <View style={styles.tableCell}>
                    <Text>{format(blotter.incident_date, "MMMM do, yyyy")}</Text>
                  </View>
                  <View style={styles.tableCell}><Text>{`Brgy. ${blotter.location}`}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.zone}</Text></View>
                  <View style={styles.tableCell}><Text>{blotter.status}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document >
  )
}
