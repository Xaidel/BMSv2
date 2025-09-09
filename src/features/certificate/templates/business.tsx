import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { PDFViewer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { Buffer } from "buffer";
import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
};

export default function BusinessPermit() {
  const { data: officials } = useOfficial();
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const purposeOptions = [
    "Business Permit",
    "Renewal",
    "Loan Requirement",
    "Others",
  ];

  const [settings, setSettings] = useState<{ Barangay: string; Municipality: string; Province: string; } | null>(null);
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [, setLogoMunicipalityDataUrl] = useState<string | null>(null);

  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
      label: `${res.Firstname} ${res.Lastname}`,
      data: res,
    }));
  }, [residents]);

  const filteredResidents = useMemo(() => {
    return allResidents.filter((res) =>
      res.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [allResidents, search]);

  const selectedResident = useMemo(() => {
    return allResidents.find((res) => res.value === value)?.data;
  }, [allResidents, value]);

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
  const { mutateAsync: addCertificate } = useAddCertificate();

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            Barangay: res.setting.Barangay || "",
            Municipality: res.setting.Municipality || "",
            Province: res.setting.Province || "",
          });
          if (res.setting.ImageB) setLogoDataUrl(res.setting.ImageB);
          if (res.setting.ImageM) setLogoMunicipalityDataUrl(res.setting.ImageM);
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

  const styles = StyleSheet.create({
    page: { padding: 20 },
    section: { marginBottom: 5 },
    heading: { fontSize: 18, marginBottom: 5 },
    bodyText: { fontSize: 14 },
  });

  return (
    <div className="flex gap-1 ">
      <Card className="flex-2 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center justify-start">
            <ArrowLeftCircleIcon className="h-8 w-8" onClick={() => navigate(-1)} />
            Barangay Business Permit
          </CardTitle>
          <CardDescription className="text-start">
            Please fill out the necessary information needed for Barangay Business Permit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full flex justify-between">
                {value
                  ? allResidents.find((res) => res.value === value)?.label
                  : "Select a Resident"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full">
              <Command>
                <CommandInput placeholder="Search Resident..." className="h-9" value={search} onValueChange={setSearch} />
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
                                if (selected.Birthday) {
                                  const dob = new Date(selected.Birthday);
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
                                setCivilStatus(selected.CivilStatus || "");
                                setValue(currentValue === value ? "" : currentValue);
                              }
                              setOpen(false);
                            }}
                          >
                            {res.label}
                            <Check className={cn("ml-auto", value === res.value ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        );
                      }}
                    />
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <div className="my-2" />
          <div className="grid gap-4">
            <div className="mt-1">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-0.5">Business Name</label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter Business Name"
              />
            </div>
            <div className="mt-1">
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-0.5">Type of Business</label>
              <input
                id="businessType"
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter Type of Business"
              />
            </div>
            <div className="mt-1">
              <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700 mb-0.5">Business Location</label>
              <input
                id="businessLocation"
                type="text"
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter Business Location"
              />
            </div>
            <div className="mt-1">
              <label htmlFor="businessOwner" className="block text-sm font-medium text-gray-700 mb-0.5">Owner</label>
              <input
                id="businessOwner"
                type="text"
                value={businessOwner}
                onChange={(e) => setBusinessOwner(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter Owner Name"
              />
            </div>
            <div className="mt-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-0.5">Amount (PHP)</label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g., 150.00"
              />
            </div>
          </div>
          <div className="mt-1">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-0.5">
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
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <Button
            onClick={async () => {
              if (!selectedResident) {
                alert("Please select a resident first.");
                return;
              }
              try {
                const cert: any = {
                  resident_id: selectedResident.ID,
                  resident_name: `${selectedResident.Firstname} ${selectedResident.Lastname}`,
                  type_: "Barangay Business Permit",
                  amount: parseFloat(amount),
                  issued_date: new Date().toISOString().split("T")[0],
                  ownership_text: businessOwner || "",
                  civil_status: civilStatus || "",
                  purpose: purpose === "custom" ? customPurpose || "" : purpose,
                  age: age ? parseInt(age) : undefined,
                };
                await addCertificate(cert);
                toast.success("Certificate saved successfully!", {
                  description: `${selectedResident.Firstname} ${selectedResident.Lastname}'s certificate was saved.`,
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
          <Document key={captainName || "no-captain"}>
            <Page size="A4" style={styles.page}>
              <View style={{ position: "relative" }}>
                <CertificateHeader />
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  BARANGAY BUSINESS PERMIT
                </Text>
                <View
                  style={{
                    border: "2pt solid black",
                    padding: 20,
                    marginBottom: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 4 }}>
                    {businessName || "________________"}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 10 }}>Business Name</Text>
                  <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 4 }}>
                    {businessType || "________________"}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 10 }}>Type of Business</Text>
                  <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 4 }}>
                    {businessLocation || "________________"}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 10 }}>Location</Text>
                  <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 4 }}>
                    {businessOwner || "________________"}
                  </Text>
                  <Text style={{ fontSize: 14 }}>Owner</Text>
                </View>
                <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                  And which said person had accomplish <Text style={{ fontWeight: "bold" }}>Barangay Ordinance No.14</Text>. This ordinance is imposing Barangay Permit fee and it is required for every business Trade or any transaction within the jurisdiction of this Barangay.
                </Text>
                <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 8 }]}>
                  This Barangay permit on business indorsed to this Municipality for registration purposes only.
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
                <Text style={[styles.bodyText, { marginTop: 10, marginBottom: 8 }]}>
                  Given this{" "}
                  {new Date().toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" })}, at {settings ? settings.Barangay : "________________"},{settings ? settings.Municipality : "________________"},{settings ? settings.Province : "________________"}
                </Text>
                <CertificateFooter styles={styles} captainName={captainName ?? ""} amount={amount} />
              </View>
            </Page>
          </Document>
        </PDFViewer>
      </div>
    </div>
  );
}
