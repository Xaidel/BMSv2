import { Text, View } from "@react-pdf/renderer";

type CertificateFooterProps = {
  styles: any;
  captainName: string | null;
  amount: string;
  assignedOfficial?: string;
};

export default function CertificateFooter({
  styles,
  captainName,
  amount,
  assignedOfficial,
}: CertificateFooterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
      }}
    >
      <View style={{ alignItems: "flex-start" }}>
        <Text style={[styles.bodyText, { marginBottom: 0 }]}>
          Certifying Officer,
        </Text>
        {assignedOfficial ? (
          <>
            <Text
              style={[
                styles.bodyText,
                { marginTop: 10, marginBottom: 4, fontWeight: "bold" },
              ]}
            >
              HON. {assignedOfficial}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>
              Officer in charge of the today
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  marginTop: 10,
                  marginBottom: 4,
                  fontWeight: "bold",
                },
              ]}
            >
              HON. {captainName || "________________"}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 10 }]}>
              Punong Barangay
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.bodyText,
                {
                  marginTop: 10,
                  marginBottom: 4,
                  fontWeight: "bold",
                },
              ]}
            >
              HON. {captainName || "________________"}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 10 }]}>
              Punong Barangay
            </Text>
          </>
        )}
      </View>
      <View>
        <Text
          style={[
            styles.bodyText,
            { fontWeight: "bold", marginTop: 23, marginBottom: 40 },
          ]}
        >
          Not valid without dry seal
        </Text>
        <Text style={[styles.bodyText, { marginBottom: 4 }]}>
          O.R. No.: ____________________
        </Text>
        <Text style={[styles.bodyText, { marginBottom: 4 }]}>
          Date: _______________________
        </Text>
        <Text style={[styles.bodyText, { marginBottom: 0 }]}>
          Amount: PHP {amount || "_________"}
        </Text>
      </View>
    </View>
  );
}
