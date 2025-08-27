import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { View, Text, Image } from "@react-pdf/renderer";

type Settings = {
  barangay: string;
  municipality: string;
  province: string;
};

export default function CertificateHeader() {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoMunicipalityDataUrl, setLogoMunicipalityDataUrl] = useState<
    string | null
  >(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    invoke("fetch_logo_command")
      .then((res) => {
        if (typeof res === "string") setLogoDataUrl(res);
      })
      .catch(console.error);

    invoke("fetch_settings_command")
      .then((res) => {
        if (typeof res === "object" && res !== null) {
          const s = res as any;
          setSettings({
            barangay: s.barangay || "",
            municipality: s.municipality || "",
            province: s.province || "",
          });
          if (s.logo) setLogoDataUrl(s.logo);
          if (s.logo_municipality)
            setLogoMunicipalityDataUrl(s.logo_municipality);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <View style={{ position: "relative" }}>
      {logoDataUrl && (
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
      )}
      {logoMunicipalityDataUrl && (
        <Image
          src={logoMunicipalityDataUrl}
          style={{
            position: "absolute",
            top: 10,
            right: 30,
            width: 90,
            height: 90,
          }}
        />
      )}
      {logoDataUrl && (
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
      )}

      <View style={{ marginBottom: 10, marginTop: 10 }}>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Republic of the Philippines
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Province of {settings?.province || "Province"}
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Municipality of {settings?.municipality || "Municipality"}
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginVertical: 3,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          BARANGAY {settings?.barangay?.toUpperCase() || "Barangay"}
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
