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
import { useEffect } from "react";
import CertificateHeader from "../certificateHeader";
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftCircleIcon, ChevronsUpDown, Check } from "lucide-react";
import CertificateFooter from "../certificateFooter";

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

export default function Indigency() {
  const [residencyYear, setResidencyYear] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [amount, setAmount] = useState("100.00");
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  // const [logoMunicipalityDataUrl, setLogoMunicipalityDataUrl] = useState<string | null>(null);
   const [settings, setSettings] = useState<{
    Barangay: string;
    Municipality: string;
    Province: string;
  } | null>(null);
  const civilStatusOptions = [
    "Single",
    "Lived-in",
    "Cohabitation",
    "Married",
    "Widowed",
    "Separated",
  ];
  const purposeOptions = [
    "Scholarship",
    "Employment",
    "Financial Assistance",
    "Identification",
  ];
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
      // Keep search value as before, but label should show middle initial
      label: `${res.Firstname} ${res.Middlename ? res.Middlename.charAt(0) + ". " : ""}${res.Lastname}`,
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
  // const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Go backend hooks/services
  const { data: officials } = useOfficial();
  const { mutateAsync: addCertificate } = useAddCertificate();

  // Barangay captain retrieval
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

  useEffect(() => {
      getSettings()
        .then((res) => {
          if (res.setting) {
            setSettings({
              Barangay: res.setting.Barangay || "",
              Municipality: res.setting.Municipality || "",
              Province: res.setting.Province || "",
            });
            // logoDataUrl and logoMunicipalityDataUrl handled by CertificateHeader
          }
        })
        .catch(console.error);
  
      getResident()
        .then((res) => {
          if (Array.isArray(res.residents)) {
            setResidents(res.residents);
            const allRes = res.residents.map((res) => ({
              value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
              label: `${res.Firstname} ${res.Middlename ? res.Middlename.charAt(0) + ". " : ""}${res.Lastname}`,
              data: res,
            }));
            const selected = allRes.find((r) => r.value === value)?.data;
            if (selected) {
              if (selected.Birthday) {
                const dob = new Date(selected.Birthday);
                const today = new Date();
                let calculatedAge = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                  calculatedAge--;
                }
                setAge(calculatedAge.toString());
              }
              setCivilStatus(selected.CivilStatus || "");
            }
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
              Indigency Certificate
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Indigency
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
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  const selected = allResidents.find(
                                    (r) => r.value === currentValue
                                  )?.data;
                                  if (selected) {
                                    if (selected.Birthday) {
                                      const dob = new Date(
                                        selected.Birthday
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
                                    setCivilStatus(selected.CivilStatus || "");
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
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Age
              </label>
              <input
                id="age"
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g., 24"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="civil_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Civil Status
              </label>
              <Select value={civilStatus} onValueChange={setCivilStatus}>
                <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                  <SelectValue placeholder="-- Select Civil Status --" />
                </SelectTrigger>
                <SelectContent>
                  {civilStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Amount (PHP)
              </label>
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
                if (!selectedResident) {
                  alert("Please select a resident first.");
                  return;
                }
                try {
                  const cert: any = {
                    resident_id: selectedResident.ID,
                    resident_name: `${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname}`,
                    type_: "Indigency Certificate",
                    amount: amount ? parseFloat(amount) : 0,
                    issued_date: new Date().toISOString().split("T")[0],
                    ownership_text: "",
                    civil_status: civilStatus || "",
                    purpose: purpose === "custom" ? customPurpose || "" : purpose,
                    age: age ? parseInt(age) : undefined,
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
                <CertificateHeader />
                <View style={styles.section}>
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
                          {`${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname}`.toUpperCase()}
                        </Text>
                        <Text>
                          , {age || "___"} years old, {civilStatus || "___"},
                          is a resident of Barangay{" "}
                          {settings ? settings.Barangay : "________________"},{" "}
                          {settings
                            ? settings.Municipality
                            : "________________"}
                          ,{" "}
                          {settings ? settings.Province : "________________"}{" "}
                          since {residencyYear || "____"}.
                        </Text>
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This certifies further that the above-named person
                        belongs to the{" "}
                        <Text style={{ fontWeight: "bold" }}>Indigency</Text>{" "}
                        sector in this Barangay and is duly recognized as such
                        by the local government unit.
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This certification is issued upon request of the
                        interested party for whatever legal purpose it may
                        serve.
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { marginTop: 10, marginBottom: 8 },
                        ]}
                      >
                        {purpose || customPurpose
                          ? `Purpose: ${
                              purpose === "custom"
                                ? customPurpose || "________________"
                                : purpose
                            }`
                          : ""}
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
                        {settings ? settings.Barangay : "________________"},
                        {settings
                          ? settings.Municipality
                          : "________________"}
                        ,{settings ? settings.Province : "________________"}
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
                    assignedOfficial={assignedOfficial}
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
