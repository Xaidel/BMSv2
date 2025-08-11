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
import { Official } from "@/types/types";

type Resident = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  civil_status?: string;
};

export default function Marriage() {
  const navigate = useNavigate()
  const [openMale, setOpenMale] = useState(false)
  const [openFemale, setOpenFemale] = useState(false)
  const [value, setValue] = useState("")
  const [value2, setValue2] = useState("")
  const [residents, setResidents] = useState<Resident[]>([]);
  const [amount, setAmount] = useState("10.00");
  const [ageMale, setAgeMale] = useState("");
  const [civilStatusMale, setCivilStatusMale] = useState("");
  const [ageFemale, setAgeFemale] = useState("");
  const [civilStatusFemale, setCivilStatusFemale] = useState("");
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
  const selectedResident2 = useMemo(() => {
    return allResidents.find((res) => res.value === value2)?.data;
  }, [allResidents, value2])
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [settings, setSettings] = useState<{ barangay: string; municipality: string; province: string } | null>(null);

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

    invoke("fetch_all_residents_command")
      .then((res) => {
        if (Array.isArray(res)) setResidents(res as Resident[]);
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
  }, []);

  // Calculate age and civil status for selected residents
  useEffect(() => {
    const male = allResidents.find((r) => r.value === value)?.data;
    if (male) {
      if (male.date_of_birth) {
        const dob = new Date(male.date_of_birth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        setAgeMale(calculatedAge.toString());
      }
      setCivilStatusMale(male.civil_status || "");
    }
    const female = allResidents.find((r) => r.value === value2)?.data;
    if (female) {
      if (female.date_of_birth) {
        const dob = new Date(female.date_of_birth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        setAgeFemale(calculatedAge.toString());
      }
      setCivilStatusFemale(female.civil_status || "");
    }
  }, [allResidents, value, value2]);
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
              Marriage Certificate
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Marriage Certification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Popover open={openMale} onOpenChange={setOpenMale}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMale}
                    className="w-full flex justify-between"
                  >
                    {value
                      ? allResidents.find((res) => res.value === value)?.label
                      : "Select Male Resident"
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
                                    const selected = allResidents.find((r) => r.value === currentValue)?.data;
                                    if (selected) {
                                      if (selected.date_of_birth) {
                                        const dob = new Date(selected.date_of_birth);
                                        const today = new Date();
                                        let calculatedAge = today.getFullYear() - dob.getFullYear();
                                        const m = today.getMonth() - dob.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                          calculatedAge--;
                                        }
                                        setAgeMale(calculatedAge.toString());
                                      } else {
                                        setAgeMale("");
                                      }
                                      setCivilStatusMale(selected.civil_status || "");
                                    }
                                    setValue(currentValue === value ? "" : currentValue);
                                    setOpenMale(false);
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
              {/* Civil Status (Male) input field */}
              <div className="mt-4">
                <label htmlFor="civilStatusMale" className="block text-sm font-medium text-gray-700 mb-1">
                  Civil Status (Male)
                </label>
                <input
                  id="civilStatusMale"
                  type="text"
                  value={civilStatusMale}
                  onChange={(e) => setCivilStatusMale(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., Single"
                />
              </div>
              {/* Age (Male) input field */}
              <div className="mt-4">
                <label htmlFor="ageMale" className="block text-sm font-medium text-gray-700 mb-1">
                  Age (Male)
                </label>
                <input
                  id="ageMale"
                  type="text"
                  value={ageMale}
                  onChange={(e) => setAgeMale(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 24"
                />
              </div>
            </div>
            <div className="mt-4">
              <Popover open={openFemale} onOpenChange={setOpenFemale}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFemale}
                    className="w-full flex justify-between"
                  >
                    {value2
                      ? allResidents.find((res) => res.value === value2)?.label
                      : "Select Female Resident"}
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
                            const res = filteredResidents[index]
                            return (
                              <CommandItem
                                key={res.value}
                                value={res.value}
                                className="text-black"
                                onSelect={(currentValue) => {
                                  const selected = allResidents.find((r) => r.value === currentValue)?.data;
                                  if (selected) {
                                    if (selected.date_of_birth) {
                                      const dob = new Date(selected.date_of_birth);
                                      const today = new Date();
                                      let calculatedAge = today.getFullYear() - dob.getFullYear();
                                      const m = today.getMonth() - dob.getMonth();
                                      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                        calculatedAge--;
                                      }
                                      setAgeFemale(calculatedAge.toString());
                                    } else {
                                      setAgeFemale("");
                                    }
                                    setCivilStatusFemale(selected.civil_status || "");
                                  }
                                  setValue2(currentValue === value2 ? "" : currentValue);
                                  setOpenFemale(false);
                                }}
                              >
                                {res.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value2 === res.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            )
                          }}
                        />
                      </div>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Civil Status (Female) input field */}
              <div className="mt-4">
                <label htmlFor="civilStatusFemale" className="block text-sm font-medium text-gray-700 mb-1">
                  Civil Status (Female)
                </label>
                <input
                  id="civilStatusFemale"
                  type="text"
                  value={civilStatusFemale}
                  onChange={(e) => setCivilStatusFemale(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., Single"
                />
              </div>
              {/* Age (Female) input field */}
              <div className="mt-4">
                <label htmlFor="ageFemale" className="block text-sm font-medium text-gray-700 mb-1">
                  Age (Female)
                </label>
                <input
                  id="ageFemale"
                  type="text"
                  value={ageFemale}
                  onChange={(e) => setAgeFemale(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 24"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Amount (PHP)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter amount"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-4">
            <Button
              onClick={async () => {
                if (!selectedResident || !selectedResident2) {
                  alert("Please select both residents.");
                  return;
                }

                try {
                  const nowIso = new Date().toISOString();
                  await invoke("save_certificate_command", {
                    cert: {
                      id: 0,
                      resident_name: `${selectedResident.first_name} ${selectedResident.last_name} & ${selectedResident2.first_name} ${selectedResident2.last_name}`,
                      type_: "Marriage Certificate",
                      issued_date: nowIso,
                      age: parseInt(ageMale),
                      civil_status: `${civilStatusMale}/${civilStatusFemale}`,
                      ownership_text: "",
                      amount: amount || "",
                    }
                  });

                  toast.success("Certificate saved successfully!", {
                    description: `Marriage certificate saved for ${selectedResident.first_name} and ${selectedResident2.first_name}`
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
                    {selectedResident && selectedResident2 ? (
                      <>
                        <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                          <Text style={{ fontWeight: "bold" }}>This is to certify that </Text>
                          <Text style={{ fontWeight: "bold" }}>{`MR. ${selectedResident.first_name} ${selectedResident.middle_name ?? ""} ${selectedResident.last_name}`.toUpperCase()}</Text>, {ageMale || "___"} years old, {civilStatusMale || "___"}, a resident of Zone 5, Tambo, Pamplona Camarines Sur, wishes to contract marriage with
                          <Text style={{ fontWeight: "bold" }}> MS. {`${selectedResident2.first_name} ${selectedResident2.middle_name ?? ""} ${selectedResident2.last_name}`.toUpperCase()}</Text>, {ageFemale || "___"} years old, {civilStatusFemale || "___"}, no legal impediment to contract marriage.
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
