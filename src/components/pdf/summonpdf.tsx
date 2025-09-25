import { Blotter } from "@/types/apitypes";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  blotters: Blotter[];
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  bodyText: {
    marginBottom: 10,
    lineHeight: 1,
  },
});

export const SummonPDF = ({ blotters }: Props) => {
  const todayDate = format(new Date(), "MMMM do, yyyy");

  return (
    <Document>
      <Page orientation="portrait" size="LETTER" style={styles.page}>
        <PDFHeader />
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 26,
            marginBottom: 18,
            fontFamily: "Times-Roman",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          BLOTTER INFORMATION
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 8,
            width: "100%",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "bold", textAlign: "right" }}>
            Case No.: {blotters[0]?.ID || "____"}
          </Text>
        </View>
        {blotters.map((blotter) => {
          const formattedHearing = blotter.HearingDate
            ? format(new Date(blotter.HearingDate), "MMMM d, yyyy 'at' h:mm a")
            : "";
          return (
            <View key={blotter.ID} style={{ marginBottom: 10 }}>
              {/* Complainant */}
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Complainant:</Text>
                <Text>
                  {blotter.ReportedBy || "________________"}
                </Text>
              </View>
              {/* Complainant Address/Zone */}
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Address/Zone:</Text>
                <Text>
                  {(blotter.Zone && blotter.Location)
                    ? `${blotter.Zone}, ${blotter.Location}, Camarines Sur`
                    : "________________"}
                </Text>
              </View>
              {/* Respondent */}
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Respondent:</Text>
                <Text>
                  {blotter.Involved || "________________"}
                </Text>
              </View>
              {/* Type of blotter */}
              <View style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Type:</Text>
                <Text>
                  {blotter.Type || "________________"}
                </Text>
              </View>
              {/* Narrative */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Narrative:</Text>
                <Text>
                  {blotter.Narrative || "________________"}
                </Text>
              </View>
              {/* Action Taken */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Action Taken:</Text>
                <Text>
                  {blotter.Action || "________________"}
                </Text>
              </View>
              {/* Witnesses */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Witnesses:</Text>
                <Text>
                  {blotter.Witnesses || "________________"}
                </Text>
              </View>
              {/* Evidence */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Evidence:</Text>
                <Text>
                  {blotter.Evidence || "________________"}
                </Text>
              </View>
              {/* Resolution */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Resolution:</Text>
                <Text>
                  {blotter.Resolution || "________________"}
                </Text>
              </View>
              {/* Hearing Date */}
              <View style={{ flexDirection: "row", marginBottom: 3, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "bold", width: 120 }}>Hearing Date:</Text>
                <Text>
                  {formattedHearing || "________________"}
                </Text>
              </View>
              {/* Footer */}
              <Text style={{ marginTop: 30, marginBottom: 10 }}>
                Prepared this <Text style={{ fontWeight: "bold" }}>{todayDate}</Text>, at Barangay Tambo, Pamplona, Camarines Sur.
              </Text>
              <View style={{ marginTop: 40, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "bold", textDecoration: "underline" }}>
                  HON. KERWIN M. DONACAO
                </Text>
                <Text>Punong Barangay/Lupon Chairman</Text>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
