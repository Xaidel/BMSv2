import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect } from "react";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Buffer } from "buffer";

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
  Zone?: number;
};

export default function Marriage() {
  const navigate = useNavigate()
  const [openMale, setOpenMale] = useState(false)
  const [openFemale, setOpenFemale] = useState(false)
  const [value, setValue] = useState("")
  const [value2, setValue2] = useState("")
  const [residents, setResidents] = useState<Resident[]>([]);
  const [amount, setAmount] = useState("100.00");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [ageMale, setAgeMale] = useState("");
  const [civilStatusMale, setCivilStatusMale] = useState("");
  const [ageFemale, setAgeFemale] = useState("");
  const [civilStatusFemale, setCivilStatusFemale] = useState("");
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
      label: `${res.Firstname} ${res.Lastname}`,
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
  const [settings, setSettings] = useState<{ barangay: string; municipality: string; province: string } | null>(null);

  const { data: officials } = useOfficial();
  const { mutateAsync: addCertificate } = useAddCertificate();

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            barangay: res.setting.Barangay || "",
            municipality: res.setting.Municipality || "",
            province: res.setting.Province || "",
          });
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
  }, []);

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

  // Calculate age and civil status for selected residents
  useEffect(() => {
    const male = allResidents.find((r) => r.value === value)?.data;
    if (male) {
      if (male.Birthday) {
        const dob = new Date(male.Birthday);
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        setAgeMale(calculatedAge.toString());
      }
      setCivilStatusMale(male.CivilStatus || "");
    }
    const female = allResidents.find((r) => r.value === value2)?.data;
    if (female) {
      if (female.Birthday) {
        const dob = new Date(female.Birthday);
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        setAgeFemale(calculatedAge.toString());
      }
      setCivilStatusFemale(female.CivilStatus || "");
    }
  }, [allResidents, value, value2]);
  const styles = StyleSheet.create({
    page: { padding: 30 },
    Section: { marginBottom: 10 },
    heading: { fontSize: 18, marginBottom: 10 },
    bodyText: { fontSize: 14 },
  });
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
                                      if (selected.Birthday) {
                                        const dob = new Date(selected.Birthday);
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
                                      setCivilStatusMale(selected.CivilStatus || "");
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
                                    if (selected.Birthday) {
                                      const dob = new Date(selected.Birthday);
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
                                    setCivilStatusFemale(selected.CivilStatus || "");
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
            <div className="mt-4">
              <label
                htmlFor="assignedOfficial"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assigned Official
              </label>
              <Select value={assignedOfficial} onValueChange={setAssignedOfficial}>
                <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                  <SelectValue placeholder="-- Select Official --" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(officials) ? officials : officials?.officials || [])
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
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-4">
            <Button
              onClick={async () => {
                if (!selectedResident || !selectedResident2) {
                  alert("Please select both male and female residents first.");
                  return;
                }
                try {
                  const cert: any = {
                    resident_id: selectedResident.ID,
                    resident_name: `${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname} & ${selectedResident2?.Firstname ?? ""} ${selectedResident2?.Middlename ? selectedResident2.Middlename.charAt(0) + ". " : ""}${selectedResident2?.Lastname ?? ""}`,
                    type_: "Marriage Certificate",
                    amount: amount ? parseFloat(amount) : 0,
                    issued_date: new Date().toISOString().split("T")[0],
                    ownership_text: "",
                    civil_status: `${civilStatusMale}/${civilStatusFemale}`,
                    age: ageMale ? parseInt(ageMale, 10) : undefined,
                    purpose: "Marriage Certificate",
                  };
                  await addCertificate(cert);
                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname}'s certificate was saved.`,
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
                    <Text style={[styles.bodyText, { marginBottom: 10, marginTop: 10 }]}>TO WHOM IT MAY CONCERN:</Text>
                    {selectedResident && selectedResident2 ? (
                      <>
                        <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                          <Text style={{ fontWeight: "bold" }}>This is to certify that </Text>
                          <Text style={{ fontWeight: "bold" }}>
                            {`MR. ${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname}`.toUpperCase()}
                          </Text>, {ageMale || "___"} years old, {civilStatusMale || "___"}, a resident of zone {selectedResident.Zone}, at {settings ? settings.barangay : "________________"}
                        ,{settings ? settings.municipality : "________________"}
                        ,{settings ? settings.province : "________________"} wishes to contract marriage with
                          <Text style={{ fontWeight: "bold" }}>
                            {`MS. ${selectedResident2.Firstname} ${selectedResident2.Middlename ? selectedResident2.Middlename.charAt(0) + ". " : ""}${selectedResident2.Lastname}`.toUpperCase()}
                          </Text>, {ageFemale || "___"} years old, {civilStatusFemale || "___"}, no legal impediment to contract marriage.
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.bodyText}>Please select a resident to view certificate.</Text>
                    )}
                      <CertificateFooter
                        styles={styles}
                        captainName={captainName}
                        amount={amount}
                        assignedOfficial={assignedOfficial}
                      />
                  </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  )
}
