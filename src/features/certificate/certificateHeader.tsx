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

export default function CertificateHeader() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [municipalityDataUrl, setLogoMunicipalityDataUrl] = useState<string | null>(null);
  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings({
          Barangay: data.setting.Barangay || "",
          Municipality: data.setting.Municipality || "",
          Province: data.setting.Province || "",
        });
        if (data.setting.ImageB) {
          setLogoDataUrl(`data:image/png;base64,${data.setting.ImageB}`);
        }
        if (data.setting.ImageM) {
          setLogoMunicipalityDataUrl(`data:image/png;base64,${data.setting.ImageM}`);
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
        src={logoDataUrl}
        style={{
          position: "absolute",
          top: 10,
          left: 30,
          width: 90,
          height: 90,
        }}
      />
      <Image
        src={municipalityDataUrl}
        style={{
          position: "absolute",
          top: 10,
          right: 30,
          width: 90,
          height: 90,
        }}
      />
      <Image
        src={logoDataUrl}
        style={{
          position: "absolute",
          top: "150%",
          left: "23%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          opacity: 0.1,
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
        CERTIFICATION
      </Text>
    </View>
  );
}
