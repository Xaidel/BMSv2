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

export const SummonPDF = ({ filter, blotters }: Props) => {
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
            SUMMONS
          </Text>
        <View
          style={{
            alignItems: "flex-start",
            marginBottom: 24,
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, width: "100%" }}>
            {/* Complainant Section */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "bold", textAlign: "left", marginBottom: 1 }}>
                {blotters[0]?.ReportedBy || "________________"}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#444",
                  textAlign: "left",
                  marginBottom: 1,
                }}
              >
                {blotters[0]
                  ? `${blotters[0].Zone}, ${blotters[0].Location}`
                  : "________________"}, Camarines Sur
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 0.5 }}>
                Complainant/s
              </Text>
            </View>
            {/* Case Number */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{ fontSize: 13, fontWeight: "bold", textAlign: "right" }}
              >
                Barangay case #{blotters[0]?.ID || "____"}
              </Text>
            </View>
          </View>
          {/* Against separator */}
          <View style={{ marginBottom: 6 }}>
            <Text
              style={{ fontSize: 11, textAlign: "left", fontStyle: "italic" }}
            >
              -against-
            </Text>
          </View>
          {/* Respondent Section */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: "bold", textAlign: "left", marginBottom: 1 }}>
              {blotters[0]?.Involved || "________________"}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Respondent/s
            </Text>
          </View>
        </View>
        {blotters.map((blotter) => {
          const formattedHearing = blotter.HearingDate
            ? format(new Date(blotter.HearingDate), "MMMM d, yyyy 'at' h:mm a")
            : "________________";
          return (
            <View key={blotter.ID} style={{ marginBottom: 10 }}>
              {/* Body text with bolded key info */}
              <Text style={styles.bodyText}>
                You are hereby summoned to appear before me in person, on{" "}
                <Text style={{ fontWeight: "bold" }}>{formattedHearing}</Text>
                {", then and there to answer to a complaint made before me, copy of which is attached to mediation/ conciliation of your dispute with "}
                <Text style={{ fontWeight: "bold" }}>complainant/s</Text>
                {"."}
              </Text>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: "bold" }}>You are hereby warned</Text>
                {" that if you refuse or willfully fail to appear in obedience to this summons, you may be barred from filling any "}
                <Text style={{ fontWeight: "bold" }}>counterclaim</Text>
                {" arising from the said complaint"}
              </Text>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: "bold" }}>FAIL NOT</Text>
                {" or else face the punishment as for contempt of the court."}
              </Text>
              <Text style={styles.bodyText}>
                Given this <Text style={{ fontWeight: "bold" }}>{todayDate}</Text>, at Barangay Tambo, Pamplona, Camarines Sur.
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
