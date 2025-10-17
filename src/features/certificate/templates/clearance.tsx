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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";
import { Resident } from "@/types/apitypes";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

export default function Clearance() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [residencyYear, setResidencyYear] = useState(""); // Add state for residency year
  // Purpose state
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const purposeOptions = [
    "Employment",
    "Bank Requirement",
    "School Requirement",
    "SSS/GSIS",
    "Postal ID",
    "Driver's License",
    "Police Clearance",
    "Travel/Passport",
    "Other",
  ];
  const civilStatusOptions = [
    "Single",
    "Lived-in",
    "Cohabitation",
    "Married",
    "Widowed",
    "Separated",
  ];
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
      label: `${res.Firstname} ${res.Lastname}`,
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

  // Official/certificate hooks
  const { data: officials } = useOfficial();
  const { mutateAsync: addCertificate } = useAddCertificate();
  // Helper to get official name by role and section
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

  // Helper to get Barangay Secretary's name
  const getSecretaryName = () => {
    if (!officials) return "";
    const list = Array.isArray(officials) ? officials : officials.officials;
    const found = list.find(
      (o) =>
        (o.Section?.toLowerCase() || "").includes("barangay officials") &&
        (o.Role?.toLowerCase() || "").includes("secretary")
    );
    return found?.Name ?? "";
  };

  // Prepared By state
  const [preparedBy, setPreparedBy] = useState("");

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
          if (res.setting.ImageM)
            setLogoMunicipalityDataUrl(res.setting.ImageM);
        }
      })
      .catch(console.error);

    getResident()
      .then((res) => {
        if (Array.isArray(res.residents)) {
          setResidents(res.residents);
          const allRes = res.residents.map((res) => ({
            value: `${res.Firstname} ${res.Lastname}`.toLowerCase(),
            label: `${res.Firstname} ${res.Lastname}`,
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

  // Set default preparedBy to secretary name if found
  useEffect(() => {
    const secName = getSecretaryName();
    setPreparedBy(secName || "");
    // Only set if not already set (to avoid overwriting user input)
    // But since officials may load later, update if blank.
  }, [officials]);
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
              Barangay Clearance
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Barangay
              Clearance Certification
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
                                    if (selected.Birthday) {
                                      const dob = new Date(selected.Birthday);
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
                Date of Residency
              </label>
              <input
                id="residency_year"
                type="text"
                value={residencyYear}
                onChange={(e) => setResidencyYear(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter year (e.g., 2016)"
              />
            </div>
            {/* Purpose of Certificate */}
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
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {purpose === "custom" && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm mt-2"
                  placeholder="Enter custom purpose"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                />
              )}
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
            {/* Prepared By input */}
            <div className="mt-4">
              <label
                htmlFor="preparedBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prepared By
              </label>
              <input
                id="preparedBy"
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter name"
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
                  const cert: any = {
                    resident_id: selectedResident.ID,
                    resident_name: `${selectedResident.Firstname} ${
                      selectedResident.Middlename
                        ? selectedResident.Middlename.charAt(0) + ". "
                        : ""
                    }${selectedResident.Lastname}`,
                    type_: "Barangay Clearance",
                    issued_date: new Date().toISOString().split("T")[0],
                    ownership_text: "",
                    civil_status: civilStatus || "",
                    purpose:
                      purpose === "custom" ? customPurpose || "" : purpose,
                    age: age ? parseInt(age) : undefined,
                  };
                  await addCertificate(cert);
                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.Firstname} ${
                      selectedResident.Middlename
                        ? selectedResident.Middlename.charAt(0) + ". "
                        : ""
                    }${selectedResident.Lastname}'s certificate was saved.`,
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
                    BARANGAY CLEARANCE
                  </Text>
                  {selectedResident ? (
                    <>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        TO WHOM IT MAY CONCERN:
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This is to certify that{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          {`${selectedResident.Firstname} ${
                            selectedResident.Middlename
                              ? selectedResident.Middlename.charAt(0) + ". "
                              : ""
                          }${selectedResident.Lastname}`.toUpperCase()}
                        </Text>
                        {`, ${age || "___"} years old, ${
                          civilStatus || "___"
                        }, and a resident of zone ${
                          selectedResident.Zone
                        }, Barangay ${
                          settings?.barangay || "________________"
                        }, ${settings?.municipality || "________________"}, ${
                          settings?.province || "________________"
                        } since ${residencyYear || "____"}. `}
                        He/She is known to me of good moral character and at
                        present has no any criminal records and/or any case in
                        this Barangay.
                      </Text>
                      {/* Purpose line */}
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        Purpose of Certificate:{" "}
                        {purpose === "custom"
                          ? customPurpose || "________________"
                          : purpose || "________________"}
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This certification is being issued upon request of the
                        above named-person for record, reference and other legal
                        matters this may serve.
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
                        })}{" "}
                         at {settings ? settings.barangay : "________________"}
                        ,{settings ? settings.municipality : "________________"}
                        ,{settings ? settings.province : "________________"}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.bodyText}>
                      Please select a resident to view certificate.
                    </Text>
                  )}
                  {/* Prepared By section above footer, consistent with Birth Certificate */}
                  <CertificateFooter
                    styles={styles}
                    captainName={captainName}
                    assignedOfficial={assignedOfficial}
                    preparedBy={preparedBy}
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
