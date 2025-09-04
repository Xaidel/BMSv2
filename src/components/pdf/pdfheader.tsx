import { useEffect, useState } from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import getSettings from "@/service/api/settings/getSettings";
import logoBarangay from "@/assets/logo_barangay.png";
import logoMunicipality from "@/assets/logo_municipality.png";

type Settings = {
  Barangay: string;
  Municipality: string;
  Province: string;
};

export default function PDFHeader() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings({
          Barangay: data.setting.Barangay || "",
          Municipality: data.setting.Municipality || "",
          Province: data.setting.Province || "",
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <View style={{ position: "relative" }}>
      <Image
        src={logoBarangay}
        style={{
          position: "absolute",
          top: 10,
          left: 30,
          width: 90,
          height: 90,
        }}
      />
      <Image
        src={logoMunicipality}
        style={{
          position: "absolute",
          top: 10,
          right: 30,
          width: 90,
          height: 90,
        }}
      />

      <View style={{ marginBottom: 10, marginTop: 10 }}>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Republic of the Philippines
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Province of {settings?.Province || "Province"}
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Municipality of {settings?.Municipality || "Municipality"}
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginVertical: 3,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          BARANGAY {settings?.Barangay?.toUpperCase() || "Barangay"}
        </Text>
      </View>

      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 10,
        }}
      >
        OFFICE OF THE PUNONG BARANGAY
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 32,
          marginBottom: 10,
          fontFamily: "Times-Roman",
        }}
      >
      </Text>
    </View>
  );
}
