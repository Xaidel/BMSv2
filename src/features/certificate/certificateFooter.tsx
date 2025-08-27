import { Text, View } from "@react-pdf/renderer";

type CertificateFooterProps = {
  styles: any;
  captainName: string | null;
  amount: string;
};

export default function CertificateFooter({
  styles,
  captainName,
  amount,
}: CertificateFooterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
      }}
    >
      <View style={{ alignItems: "flex-start" }}>
        <Text
          style={[
            styles.bodyText,
            { marginBottom: 6 },
          ]}
        >
          Certifying Officer,
        </Text>
        <Text
          style={[
            styles.bodyText,
            {
              marginTop: 20,
              marginBottom: 4,
              fontWeight: "bold",
            },
          ]}
        >
          HON. {captainName || "________________"}
        </Text>
        <Text
          style={[
            styles.bodyText,
            { marginBottom: 10 },
          ]}
        >
          Punong Barangay
        </Text>
        <Text
          style={[
            styles.bodyText,
            { marginBottom: 4 },
          ]}
        >
          O.R. No.: ____________________
        </Text>
        <Text
          style={[
            styles.bodyText,
            { marginBottom: 4 },
          ]}
        >
          Date: _________________________
        </Text>
        <Text style={styles.bodyText}>
          Amount: PHP {amount || "_________"}
        </Text>
      </View>
      <View>
        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
          Not valid without dry seal
        </Text>
      </View>
    </View>
  );
}