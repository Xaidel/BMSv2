import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect } from "react";

import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import getBlotter from "@/service/api/blotter/getBlotter";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftCircleIcon } from "lucide-react";
import { Buffer } from "buffer";
import CertificateHeader from "@/features/certificate/certificateHeader";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

type Resident = {
  ID?: number;
  Firstname: string;
  Middlename?: string;
  Lastname: string;
  Suffix?: string;
  Birthday?: Date;
  CivilStatus?: string;
  IssuedDate?: string;
};

export default function SummonPDF() {
  const { data: officials } = useOfficial();
  const navigate = useNavigate();
  const [, setResidents] = useState<Resident[]>([]);
  const [complainant, setComplainant] = useState("");
  const [respondent, setRespondent] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [, setBlotters] = useState<any[]>([]);
  const getOfficialName = (role: string, section: string) => {
    if (!officials) return null;
    const list = Array.isArray(officials) ? officials : officials.officials;
    const found = list.find(
      (o) =>
        (o.Section?.toLowerCase() || "").includes(section.toLowerCase()) &&
        (o.Role?.toLowerCase() || "").includes(role.toLowerCase())
    );
    return found?.Name ?? null;
  };

  const captainName = getOfficialName("barangay captain", "barangay officials");
  
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [, setLogoMunicipalityDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    Barangay: string;
    Municipality: string;
    Province: string;
  } | null>(null);

  const todayDate = new Date().toLocaleDateString("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            Barangay: res.setting.Barangay || "",
            Municipality: res.setting.Municipality || "",
            Province: res.setting.Province || "",
          });
          if (res.setting.ImageB) {
            setLogoDataUrl(`data:image/png;base64,${res.setting.ImageB}`);
          }
          if (res.setting.ImageM) {
            setLogoMunicipalityDataUrl(
              `data:image/png;base64,${res.setting.ImageM}`
            );
          }
        }
      })
      .catch(console.error);

    getResident()
      .then((res) => {
        if (Array.isArray(res.residents)) {
          setResidents(res.residents);
        }
      })
      .catch(console.error);

    getBlotter()
      .then((res) => {
        if (Array.isArray(res.blotters)) {
          setBlotters(res.blotters);
        }
      })
      .catch(console.error);
  }, []);

  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    heading: { fontSize: 18, marginBottom: 10 },
    bodyText: { fontSize: 14 },
  });

  return (
    <>
      <div className="flex gap-1 ">
        <Card className="flex-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center justify-start">
              <ArrowLeftCircleIcon
                className="h-8 w-8"
                onClick={() => navigate(-1)}
              />
              Summons Letter
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for the Summons of Hearing Letter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {/* Complainant */}
              <div className="mt-2">
                <label
                  htmlFor="complainant"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Complainant
                </label>
                <input
                  id="complainant"
                  type="text"
                  value={complainant}
                  onChange={(e) => setComplainant(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter complainant name"
                />
              </div>
              {/* Respondent */}
              <div className="mt-4">
                <label
                  htmlFor="respondent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Respondent
                </label>
                <input
                  id="respondent"
                  type="text"
                  value={respondent}
                  onChange={(e) => setRespondent(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter respondent name"
                />
              </div>
              {/* Case Number */}
              <div className="mt-4">
                <label
                  htmlFor="caseNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Case Number
                </label>
                <input
                  id="caseNumber"
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter case number"
                />
              </div>
              {/* Hearing Date */}
              <div className="mt-4">
                <label
                  htmlFor="hearingDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hearing Date
                </label>
                <div className="flex flex-col gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between">
                        {hearingDate
                          ? format(new Date(hearingDate), "PPP")
                          : "Pick a date"}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={hearingDate ? new Date(hearingDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const oldDate = hearingDate ? new Date(hearingDate) : new Date();
                            date.setHours(oldDate.getHours(), oldDate.getMinutes());
                            setHearingDate(date.toISOString());
                          }
                        }}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={
                      hearingDate
                        ? new Date(hearingDate).toLocaleTimeString("en-GB", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""
                    }
                    onChange={(e) => {
                      if (hearingDate) {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const newDate = new Date(hearingDate);
                        newDate.setHours(hours, minutes, 0, 0);
                        setHearingDate(newDate.toISOString());
                      }
                    }}
                    className="text-black mt-2"
                  />
                </div>
              </div>
              {/* Assigned Official */}
              <div className="mt-4">
                <label
                  htmlFor="assignedOfficial"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assigned Official
                </label>
                <Select
                  value={assignedOfficial}
                  onValueChange={setAssignedOfficial}
                >
                  <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                    <SelectValue placeholder="-- Select Official --" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(officials)
                      ? officials
                      : officials?.officials || []
                    )
                      .filter((official: any) => {
                        const role = (official.Role || "").toLowerCase();
                        return !role.includes("sk") && !role.includes("tanod");
                      })
                      .map((official: any) => (
                        <SelectItem key={official.ID} value={official.Name}>
                          {official.Name} - {official.Role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-4">
          </CardFooter>
        </Card>
        <div className="flex-4">
          <PDFViewer width="100%" height={600}>
            <Document key={captainName || "no-captain"}>
              <Page size="A4" style={styles.page}>
                <View style={{ position: "relative" }}>
                  {/* Header */}
                  <CertificateHeader />
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 26,
                      marginBottom: 20,
                      fontFamily: "Times-Roman",
                    }}
                  >
                    SUMMONS
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bodyText, { fontWeight: "bold" }]}>Complainant:</Text>
                      <Text style={styles.bodyText}>{complainant || "___________________________"}</Text>
                      <Text style={styles.bodyText}>
                        {settings ? settings.Barangay : "________________"}, {settings ? settings.Municipality : "________________"}, {settings ? settings.Province : "________________"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
                        Case No.: <Text style={styles.bodyText}>{caseNumber || "__________"}</Text>
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.bodyText, { textAlign: "left", marginBottom: 12, fontStyle: "italic" }]}>
                    -against-
                  </Text>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.bodyText, { fontWeight: "bold" }]}>Respondent:</Text>
                    <Text style={styles.bodyText}>{respondent || "___________________________"}</Text>
                  </View>
                  <Text style={[styles.bodyText, { marginBottom: 12 }]}>
                    You are hereby summoned to appear before the Barangay Captain or his/her duly authorized representative on{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {hearingDate
                        ? new Date(hearingDate).toLocaleDateString("en-PH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "__________________"}
                    </Text>{" "}
                    at{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {hearingDate
                        ? new Date(hearingDate).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "________"}
                    </Text>{" "}
                    at the Barangay Hall located at {settings ? settings.Barangay : "________________"}, {settings ? settings.Municipality : "________________"}, {settings ? settings.Province : "________________"} to answer the complaint filed against you.
                  </Text>
                  <Text style={[styles.bodyText, { marginBottom: 12 }]}>
                    You are hereby warned that failure to file a counterclaim within the prescribed period shall be deemed a waiver of such right.
                  </Text>
                  <Text style={[styles.bodyText, { marginBottom: 12, fontWeight: "bold" }]}>
                    FAIL NOT TO APPEAR OTHERWISE, THE CASE WILL PROCEED IN YOUR ABSENCE.
                  </Text>
                  <Text style={[styles.bodyText, { marginBottom: 40 }]}>
                    Given this {todayDate} at {settings ? settings.Barangay : "________________"}, {settings ? settings.Municipality : "________________"}, {settings ? settings.Province : "________________"}.
                  </Text>
                  <View style={{ alignItems: "flex-end" }}>
                    {assignedOfficial ? (
                      <>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                          HON. {assignedOfficial}
                        </Text>
                        <Text style={{ fontSize: 13 }}>Barangay Official</Text>
                      </>
                    ) : (
                      <>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                          HON. {captainName || "_________________________"}
                        </Text>
                        <Text style={{ fontSize: 13 }}>Barangay Captain</Text>
                      </>
                    )}
                  </View>
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  );
}
