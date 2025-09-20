import { useEffect, useState } from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import getSettings from "@/service/api/settings/getSettings";
import logoBarangay from "@/assets/logo_barangay.png";
import logoMunicipality from "@/assets/logo_municipality.png";

type Settings = {
  Barangay: string;
  Municipality: string;
  Province: string;
  ImageB?: string;
  ImageM?: string;
};

export default function PDFHeader() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [municipalityDataUrl, setMunicipalityDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await getSettings();
        const setting = res.setting;
        setSettings({
          Barangay: setting.Barangay || "",
          Municipality: setting.Municipality || "",
          Province: setting.Province || "",
          ImageB: setting.ImageB,
          ImageM: setting.ImageM,
        });
        // Handle logo image
        if (setting.ImageB) {
          let imgB = setting.ImageB;
          if (!imgB.startsWith("data:image/png;base64,")) {
            imgB = "data:image/png;base64," + imgB;
          }
          setLogoDataUrl(imgB);
        }
        // Handle municipality image
        if (setting.ImageM) {
          let imgM = setting.ImageM;
          if (!imgM.startsWith("data:image/png;base64,")) {
            imgM = "data:image/png;base64," + imgM;
          }
          setMunicipalityDataUrl(imgM);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <View style={{ position: "relative" }}>
      <Image
        src={logoDataUrl || logoBarangay}
        style={{
          position: "absolute",
          top: 10,
          left: 30,
          width: 90,
          height: 90,
        }}
      />
      <Image
        src={municipalityDataUrl || logoMunicipality}
        style={{
          position: "absolute",
          top: 10,
          right: 30,
          width: 90,
          height: 90,
        }}
      />

      <Image
        src={logoDataUrl || logoBarangay}
        style={{
          position: "absolute",
          top: 190,
          left: "50%",
          marginLeft: -150,
          width: 300,
          height: 300,
          opacity: 0.1,
        }}
      />

      <View style={{ marginBottom: 10, marginTop: 10 }}>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Republic of the Philippines
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Province of {settings?.Province || "Camarines Sur"}
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Municipality of {settings?.Municipality || "Pamplona"}
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginVertical: 3,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          BARANGAY {settings?.Barangay?.toUpperCase() || "Tambo"}
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
    </View>
  );
}
