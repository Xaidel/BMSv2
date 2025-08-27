import { Buffer } from "buffer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { toast } from "sonner";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { Official } from "@/types/types";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

type Resident = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  civil_status?: string;
};

export default function Residency() {
  const [residencyYear, setResidencyYear] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [amount, setAmount] = useState("");
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.first_name} ${res.last_name}`.toLowerCase(),
      label: `${res.first_name} ${res.last_name}`,
      data: res,
    }));
  }, [residents]);
  const [search, setSearch] = useState("");
  const filteredResidents = useMemo(() => {
    return allResidents.filter((res) =>
      res.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [allResidents, search]);
  const selectedResident = useMemo(() => {
    return allResidents.find((res) => res.value === value)?.data;
  }, [allResidents, value]);
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [, setLogoMunicipalityDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);
  const [captainName, setCaptainName] = useState<string | null>(null);

  const purposeOptions = [
    "Scholarship",
    "Employment",
    "Financial Assistance",
    "Identification",
  ];

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
          if (s.logo) {
            setLogoDataUrl(s.logo);
          }
          if (s.logo_municipality) {
            setLogoMunicipalityDataUrl(s.logo_municipality);
          }
        }
      })
      .catch(console.error);

    invoke("fetch_all_residents_command")
      .then((res) => {
        if (Array.isArray(res)) {
          setResidents(res as Resident[]);
          const allRes = (res as Resident[]).map((res) => ({
            value: `${res.first_name} ${res.last_name}`.toLowerCase(),
            label: `${res.first_name} ${res.last_name}`,
            data: res,
          }));
          const selected = allRes.find((r) => r.value === value)?.data;
          if (selected) {
            if (selected.date_of_birth) {
              const dob = new Date(selected.date_of_birth);
              const today = new Date();
              let calculatedAge = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                calculatedAge--;
              }
              setAge(calculatedAge.toString());
            }
            setCivilStatus(selected.civil_status || "");
          }
        }
      })
      .catch(console.error);

    // Fetch captain's name
    invoke<Official[]>("fetch_all_officials_command")
      .then((data) => {
        const captain = data.find(
          (person) =>
            person.section.toLowerCase() === "barangay officials" &&
            person.role.toLowerCase() === "barangay captain"
        );
        if (captain) {
          setCaptainName(captain.name);
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
              Residency Certificate
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Residency
              Certification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full flex justify-between"
                  >
                    {value
                      ? allResidents.find((res) => res.value === value)?.label
                      : "Select a Resident"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full">
                  <Command>
                    <CommandInput
                      placeholder="Search Resident..."
                      className="h-9"
                      value={search}
                      onValueChange={setSearch}
                    />
                    {allResidents.length === 0 ? (
                      <CommandEmpty>No Residents Found</CommandEmpty>
                    ) : (
                      <div className="h-60 overflow-hidden">
                        <Virtuoso
                          style={{ height: "100%" }}
                          totalCount={filteredResidents.length}
                          itemContent={(index) => {
                            const res = filteredResidents[index];
                            return (
                              <CommandItem
                                key={res.value}
                                value={res.value}
                                className="text-black"
                                onSelect={(currentValue) => {
                                  const selected = allResidents.find(
                                    (r) => r.value === currentValue
                                  )?.data;
                                  if (selected) {
                                    if (selected.date_of_birth) {
                                      const dob = new Date(
                                        selected.date_of_birth
                                      );
                                      const today = new Date();
                                      let calculatedAge =
                                        today.getFullYear() - dob.getFullYear();
                                      const m =
                                        today.getMonth() - dob.getMonth();
                                      if (
                                        m < 0 ||
                                        (m === 0 &&
                                          today.getDate() < dob.getDate())
                                      ) {
                                        calculatedAge--;
                                      }
                                      setAge(calculatedAge.toString());
                                    } else {
                                      setAge("");
                                    }
                                    setCivilStatus(selected.civil_status || "");
                                    setValue(
                                      currentValue === value ? "" : currentValue
                                    );
                                  }
                                  setOpen(false);
                                }}
                              >
                                {res.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value === res.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          }}
                        />
                      </div>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black"
                placeholder="Auto-filled age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Civil Status
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black"
                placeholder="Auto-filled civil status"
                value={civilStatus}
                onChange={(e) => setCivilStatus(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="residency_year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Residency Year
              </label>
              <Select value={residencyYear} onValueChange={setResidencyYear}>
                <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                  <SelectValue placeholder="-- Select Residency Year --" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: new Date().getFullYear() - 1900 + 1 },
                    (_, i) => (1900 + i).toString()
                  ).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Purpose of Certificate
              </label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                  <SelectValue placeholder="-- Select Purpose --" />
                </SelectTrigger>
                <SelectContent>
                  {purposeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other (please specify)</SelectItem>
                </SelectContent>
              </Select>
              {purpose === "custom" && (
                <input
                  type="text"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm mt-2"
                  placeholder="Please specify the purpose"
                />
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Amount
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-black"
                placeholder="e.g. 10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-4">
            <Button
              onClick={async () => {
                if (!selectedResident) {
                  alert("Please select a resident first.");
                  return;
                }

                try {
                  const nowIso = new Date().toISOString();
                  await invoke("save_certificate_command", {
                    cert: {
                      resident_name: `${selectedResident.first_name} ${selectedResident.last_name}`,
                      id: 0,
                      type_: "Residency Certificate",
                      issued_date: nowIso,
                      age: age ? parseInt(age) : undefined,
                      civil_status: civilStatus || "",
                      ownership_text: "",
                      amount: amount || "",
                      purpose: purpose === "custom" ? customPurpose || "" : purpose,
                    },
                  });

                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.first_name} ${selectedResident.last_name}'s certificate was saved.`,
                  });
                } catch (error) {
                  console.error("Save certificate failed:", error);
                  alert("Failed to save certificate.");
                }
              }}
            >
              Save
            </Button>
          </CardFooter>
        </Card>
        <div className="flex-4">
          <PDFViewer width="100%" height={600}>
            <Document>
              <Page size="A4" style={styles.page}>
                <View style={{ position: "relative" }}>
                  <CertificateHeader />
                    <Text
                      style={[
                        styles.bodyText,
                        { marginBottom: 10, marginTop: 10 },
                      ]}
                    >
                      TO WHOM IT MAY CONCERN:
                    </Text>
                    {selectedResident ? (
                      <>
                        <Text
                          style={[
                            styles.bodyText,
                            { textAlign: "justify", marginBottom: 8 },
                          ]}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            This is to certify that{" "}
                          </Text>
                          <Text style={{ fontWeight: "bold" }}>
                            {`${selectedResident.first_name} ${selectedResident.last_name}`.toUpperCase()}
                          </Text>
                          <Text>
                            , {age || "___"} years old, {civilStatus || "___"},
                            is a bonafide resident of{" "}
                            {settings ? settings.barangay : "________________"},{" "}
                            {settings ? settings.municipality : "________________"},{" "}
                            {settings ? settings.province : "________________"} since {residencyYear || "____"}. 
                          </Text>
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            { textAlign: "justify", marginBottom: 8 },
                          ]}
                        >
                          This certification is being issued upon the request of
                          the aforementioned person for residency verification
                          and for the following purpose: {purpose === "custom" ? (customPurpose || "________________") : (purpose || "________________")}.
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            { marginTop: 10, marginBottom: 8 },
                          ]}
                        >
                          Given this{" "}
                          {new Date().toLocaleDateString("en-PH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          , at{" "}
                          {settings ? settings.barangay : "________________"},
                          {settings
                            ? settings.municipality
                            : "________________"}
                          ,{settings ? settings.province : "________________"}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.bodyText}>
                        Please select a resident to view certificate.
                      </Text>
                    )}
                      <CertificateFooter
                      styles={styles}
                      captainName={captainName}
                      amount={amount}
                    />
                  </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  );
}
