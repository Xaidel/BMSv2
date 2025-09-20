import { Buffer } from "buffer";
import { toast } from "sonner";
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
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import CertificateHeader from "../certificateHeader";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import CertificateFooter from "../certificateFooter";
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
  date_of_birth: any;
  civil_status: string;
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
};

export default function BusinessClearance() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
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
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  // Resident selection state
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  // Captain name state is now derived below via getOfficialName.
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const purposeOptions = [
    "Business Permit",
    "Renewal",
    "Loan Requirement",
    "Others",
  ];

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            barangay: res.setting.Barangay || "",
            municipality: res.setting.Municipality || "",
            province: res.setting.Province || "",
          });
          if (res.setting.ImageB) setLogoDataUrl(res.setting.ImageB);
        }
      })
      .catch(console.error);

    getResident()
      .then((res) => {
        if (Array.isArray(res.residents)) {
          // Map the API resident type to the local Resident type
          const mapped = res.residents.map((r: any) => ({
            id: r.id ?? r.ID,
            first_name: r.first_name ?? r.Firstname,
            middle_name: r.middle_name ?? r.Middlename,
            last_name: r.last_name ?? r.Lastname,
            suffix: r.suffix ?? r.Suffix,
            date_of_birth: r.date_of_birth ?? r.Birthday,
            civil_status: r.civil_status ?? r.CivilStatus ?? "",
          }));
          setResidents(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const { data: officials } = useOfficial();
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
              Barangay Business Clearance
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Barangay
              Business Clearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Select Resident Dropdown */}
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
                                    const m = today.getMonth() - dob.getMonth();
                                    if (
                                      m < 0 ||
                                      (m === 0 &&
                                        today.getDate() < dob.getDate())
                                    ) {
                                      calculatedAge--;
                                    }
                                    try {
                                      setAge(calculatedAge.toString());
                                    } catch {}
                                  } else {
                                    try {
                                      setAge("");
                                    } catch {}
                                  }
                                  try {
                                    setCivilStatus(selected.civil_status || "");
                                  } catch {}
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
            <div className="my-4" />
            {/* End Select Resident Dropdown */}
            <div>
              <div className="mt-4">
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Business Name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type of Business
                </label>
                <input
                  id="businessType"
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Type of Business"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="businessLocation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Location
                </label>
                <input
                  id="businessLocation"
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Business Location"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="businessOwner"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Owner
                </label>
                <input
                  id="businessOwner"
                  type="text"
                  value={businessOwner}
                  onChange={(e) => setBusinessOwner(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Owner Name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (PHP)
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 150.00"
                />
              </div>
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
                    <SelectItem value="custom">
                      Other (please specify)
                    </SelectItem>
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-2">
            <Button
              onClick={async () => {
                const selectedResident = allResidents.find(
                  (res) => res.value === value
                )?.data;
                if (!selectedResident) {
                  alert("Please select a resident first.");
                  return;
                }
                try {
                  const cert: any = {
                    resident_id: selectedResident.id,
                    resident_name: `${selectedResident.first_name} ${
                      selectedResident.middle_name
                        ? selectedResident.middle_name.charAt(0) + ". "
                        : ""
                    }${selectedResident.last_name}`,
                    type_: "Barangay Business Clearance",
                    amount: parseFloat(amount),
                    issued_date: new Date().toISOString().split("T")[0],
                    ownership_text: businessOwner || "",
                    civil_status: civilStatus || "",
                    purpose:
                      purpose === "custom" ? customPurpose || "" : purpose,
                    age: age ? parseInt(age) : undefined,
                  };
                  await addCertificate(cert);
                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.first_name} ${
                      selectedResident.middle_name
                        ? selectedResident.middle_name.charAt(0) + ". "
                        : ""
                    }${selectedResident.last_name}'s certificate was saved.`,
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
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 24,
                      marginBottom: 10,
                      fontFamily: "Times-Roman",
                    }}
                  >
                    BARANGAY BUSINESS CLEARANCE
                  </Text>
                  <View style={styles.section}>
                    <View
                      style={{
                        border: "2pt solid black",
                        padding: 20,
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        {businessName || "________________"}
                      </Text>
                      <Text style={{ fontSize: 14, marginBottom: 10 }}>
                        Business Name
                      </Text>
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        {businessType || "________________"}
                      </Text>
                      <Text style={{ fontSize: 14, marginBottom: 10 }}>
                        Type of Business
                      </Text>
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        {businessLocation || "________________"}
                      </Text>
                      <Text style={{ fontSize: 14, marginBottom: 10 }}>
                        Location
                      </Text>
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        {businessOwner || "________________"}
                      </Text>
                      <Text style={{ fontSize: 14 }}>Owner</Text>
                    </View>
                    <>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This is to certify that the above-named individual is a
                        bona fide resident of Barangay{" "}
                        {settings?.barangay || "________________"},
                        {settings?.municipality || "________________"},
                        {settings?.province || "________________"}, and is duly
                        authorized to operate his/her business within the
                        jurisdiction of this Barangay.
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This clearance is issued upon request for compliance
                        with local business regulations and may be presented to
                        relevant authorities as proof of residency and business
                        authorization.
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
                          { marginTop: 0, marginBottom: 4 },
                        ]}
                      >
                        Given this{" "}
                        {new Date().toLocaleDateString("en-PH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        , at {settings ? settings.barangay : "________________"}
                        ,{settings ? settings.municipality : "________________"}
                        ,{settings ? settings.province : "________________"}
                      </Text>
                    </>
                    <CertificateFooter
                      styles={styles}
                      captainName={captainName}
                      amount={amount}
                      assignedOfficial={assignedOfficial}
                    />
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
