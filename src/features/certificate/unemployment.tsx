type Official = {
  id: number;
  name: string;
  role: string;
  image: string;
  section: string;
};
import { Buffer } from "buffer";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect } from "react";
import { Image } from "@react-pdf/renderer";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

type Resident = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  age?: number;
  civil_status?: string;
  date_of_birth?: string;
  // Add more fields if needed
};


export default function Unemployment() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [residents, setResidents] = useState<Resident[]>([]);
  const [captainName, setCaptainName] = useState<string | null>(null);
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.first_name} ${res.last_name}`.toLowerCase(),
      label: `${res.first_name} ${res.last_name}`,
      data: res,
    }));
  }, [residents]);
  const [search, setSearch] = useState("")
  const filteredResidents = useMemo(() => {
    return allResidents.filter((res) =>
      res.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [allResidents, search])
  const selectedResident = useMemo(() => {
    return allResidents.find((res) => res.value === value)?.data;
  }, [allResidents, value])
  const [amount, setAmount] = useState("10.00");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [settings, setSettings] = useState<{ barangay: string; municipality: string; province: string } | null>(null);
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");

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
        }
      })
      .catch(console.error);

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

    invoke("fetch_all_residents_command")
      .then((res) => {
        // Ensure age and civil_status are present in each resident object, fallback to undefined if missing
        if (Array.isArray(res)) {
          setResidents(
            (res as any[]).map((resident) => ({
              ...resident,
              age: resident.age,
              civil_status: resident.civil_status,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedResident?.date_of_birth) {
      const dob = new Date(selectedResident.date_of_birth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    } else {
      setAge("");
    }
    setCivilStatus(selectedResident?.civil_status || "");
  }, [selectedResident]);

  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    heading: { fontSize: 18, marginBottom: 10 },
    bodyText: { fontSize: 14 },
  });
  // Download/Print handler function
  /* function handleDownload() {
     if (!selectedResident) {
       alert("Please select a resident first.");
       return;
     }
     console.log("Download started...");
     // Download/print logic goes here...
   }*/
  return (
    <>
      <div className="flex gap-1 ">
        <Card className="flex-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center justify-start">
              <ArrowLeftCircleIcon className="h-8 w-8" onClick={() => navigate(-1)} />
              Unemployment Certificate
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Unemployment Certification
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
                      : "Select a Resident"
                    }
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
                    )
                      :
                      (
                        <div className="h-60 overflow-hidden">
                          <Virtuoso
                            style={{ height: "100%" }}
                            totalCount={filteredResidents.length}
                            itemContent={(index) => {
                              const res = filteredResidents[index]
                              return (
                                <CommandItem
                                  key={res.value}
                                  value={res.value}
                                  className="text-black"
                                  onSelect={(currentValue) => {
                                    setValue(
                                      currentValue === value ? "" : currentValue
                                    )
                                    setOpen(false)
                                  }}
                                >
                                  {res.label}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      value === res.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              )
                            }}
                          />
                        </div>
                      )
                    }
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  placeholder="Auto-filled age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  placeholder="Auto-filled civil status"
                  value={civilStatus}
                  onChange={(e) => setCivilStatus(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Amount (PHP)
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 10.00"
                />
              </div>
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
                      type_: "Unemployment Certificate",
                      issued_date: nowIso,
                      age: age ? parseInt(age) : undefined,
                      civil_status: civilStatus || "",
                      ownership_text: "",
                      amount: amount || "",
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
                  {logoDataUrl && (
                    <Image
                      src={logoDataUrl}
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 30,
                        width: 90,
                        height: 90
                      }}
                    />
                  )}
                  {logoDataUrl && (
                    <Image
                      src={logoDataUrl}
                      style={{
                        position: "absolute",
                        top: "35%",
                        left: "23%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        height: 400,
                        opacity: 0.1,
                      }}
                    />
                  )}
                  <View style={styles.section}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: "center" }}>Republic of the Philippines</Text>
                        <Text style={{ textAlign: "center" }}>Province of {settings?.province || "Province"}</Text>
                        <Text style={{ textAlign: "center" }}>Municipality of {settings?.municipality || "Municipality"}</Text>
                        <Text style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}>BARANGAY {settings?.barangay?.toUpperCase() || "Barangay"}</Text>
                      </View>
                    </View>
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
                      OFFICE OF THE PUNONG BARANGAY
                    </Text>
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>C E R T I F I C A T I O N</Text>
                    <Text style={[styles.bodyText, { marginBottom: 10, marginTop: 10 }]}>TO WHOM IT MAY CONCERN:</Text>
                    {selectedResident ? (
                      <>
                        <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                          <Text style={{ fontWeight: "bold" }}>This is to certify that </Text>
                          <Text style={{ fontWeight: "bold" }}>{`${selectedResident.first_name} ${selectedResident.last_name}`.toUpperCase()}</Text>
                          <Text>, {age}, {civilStatus.toLowerCase() || "civil status"}, is a resident of Barangay Tambo, Pamplona, Camarines Sur.</Text>
                        </Text>
                        <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                          This certifies further that the above-named person is currently <Text style={{ fontWeight: "bold" }}>unemployed</Text> and is actively seeking employment.
                        </Text>
                        <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                          This certification is issued upon request of the interested party for record and reference purposes.
                        </Text>
                        <Text style={[styles.bodyText, { marginTop: 8 }]}>
                        </Text>
                        <Text style={[styles.bodyText, { marginTop: 10, marginBottom: 8 }]}>
                          Given this {new Date().toLocaleDateString("en-PH", {
                            day: "numeric", month: "long", year: "numeric"
                          })}, at Tambo, Pamplona, Camarines Sur.
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.bodyText}>Please select a resident to view certificate.</Text>
                    )}
                    <Text style={[styles.bodyText, { marginTop: 40, marginBottom: 6 }]}>Certifying Officer,</Text>
                    <Text style={[styles.bodyText, { marginTop: 20, marginBottom: 4, fontWeight: "bold" }]}>
                      HON. {captainName || "________________"}
                    </Text>
                    <Text style={[styles.bodyText, { marginBottom: 10 }]}>Punong Barangay</Text>
                    <Text style={[styles.bodyText, { marginBottom: 4 }]}>O.R. No.: ____________________</Text>
                    <Text style={[styles.bodyText, { marginBottom: 4 }]}>Date: _________________________</Text>
                    <Text style={styles.bodyText}>Amount: PHP {amount}</Text>
                  </View>
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  )
}
