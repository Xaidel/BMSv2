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
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";

/** 🔁 Mirror Fourps data layer */
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

/** Keep local shape used by this component’s UI and PDF content */
type Resident = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  civil_status?: string;
};

export default function soloParent() {
  const { data: officials } = useOfficial();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [soloParentText, setSoloParentText] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [assignedOfficial, setAssignedOfficial] = useState("");

  // logos are loaded like in Fourps, even if not used directly
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [, setLogoMunicipalityDataUrl] = useState<string | null>(null);

  // Keep lowercase keys because the body references settings.barangay / municipality / province
  const [settings, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);

  /** Derive captain’s name like Fourps */
  const getOfficialName = (role: string, section: string) => {
    if (!officials) return null;
    const list = Array.isArray(officials) ? officials : officials.officials;
    const found = list?.find(
      (o: any) =>
        (o.Section?.toLowerCase() || "").includes(section.toLowerCase()) &&
        (o.Role?.toLowerCase() || "").includes(role.toLowerCase())
    );
    return found?.Name ?? null;
  };
  const captainName = getOfficialName("barangay captain", "barangay officials");

  /** Same resident picker logic as Fourps */
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

  /** Use the same certificate mutation hook as Fourps */
  const { mutateAsync: addCertificate } = useAddCertificate();

  /** Mirror Fourps effect: settings + logos + residents */
  useEffect(() => {
    // Settings
    getSettings()
      .then((res) => {
        if (res?.setting) {
          // Map to lowercase keys used by the existing body
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

    // Residents (map API shape -> local snake_case shape used in this component)
    getResident()
      .then((res) => {
        if (Array.isArray(res?.residents)) {
          const normalized: Resident[] = res.residents.map((r: any) => ({
            id: r.ID,
            first_name: r.Firstname,
            middle_name: r.Middlename,
            last_name: r.Lastname,
            suffix: r.Suffix,
            date_of_birth: r.Birthday ? String(r.Birthday) : undefined,
            civil_status: r.CivilStatus,
          }));
          setResidents(normalized);

          // If a value was already chosen, sync age + civil status from the new list
          const allRes = normalized.map((r) => ({
            value: `${r.first_name} ${r.last_name}`.toLowerCase(),
            label: `${r.first_name} ${r.last_name}`,
            data: r,
          }));
          const sel = allRes.find((r) => r.value === value)?.data;
          if (sel) {
            if (sel.date_of_birth) {
              const dob = new Date(sel.date_of_birth);
              const today = new Date();
              let calculatedAge = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                calculatedAge--;
              }
              setAge(String(calculatedAge));
            }
            setCivilStatus(sel.civil_status || "");
          }
        }
      })
      .catch(console.error);
  }, []); // mirror Fourps’ one-time load

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
              Certificate of Solo Parent
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for the issuance
              of a Solo Parent Certification.
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
              <div className="mt-4">
                <label
                  htmlFor="soloParent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Children
                </label>
                <input
                  id="soloParent"
                  type="text"
                  value={soloParentText}
                  onChange={(e) => setSoloParentText(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 4."
                />
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
                    {[
                      "Single",
                      "Lived-in",
                      "Cohabitation",
                      "Married",
                      "Widowed",
                      "Separated",
                    ].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Purpose block */}
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
                    {[
                      "Scholarship",
                      "Employment",
                      "Financial Assistance",
                      "Identification",
                    ].map((option) => (
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
              <div className="mt-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
              {/* Assigned Official block */}
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
            <Button
              onClick={async () => {
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
                    type_: "Solo Parent Certificate",
                    amount: amount ? parseFloat(amount) : 0,
                    issued_date: new Date().toISOString().split("T")[0],
                    ownership_text: "",
                    civil_status: civilStatus || "",
                    soloParent_text: soloParentText,
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
                    CERTIFICATE OF SOLO PARENT
                  </Text>
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
                          {`${selectedResident.first_name} ${
                            selectedResident.middle_name
                              ? selectedResident.middle_name.charAt(0) + ". "
                              : ""
                          }${selectedResident.last_name}`.toUpperCase()}
                        </Text>
                        <Text>
                          , {age || "___"} years old, {civilStatus || "___"}, a
                          resident of Barangay{" "}
                          {settings ? settings.barangay : "________________"},{" "}
                          {settings
                            ? settings.municipality
                            : "________________"}
                          , {settings ? settings.province : "________________"},
                          is hereby certified as a{" "}
                          <Text style={{ fontWeight: "bold" }}>
                            Solo Parent
                          </Text>{" "}
                          with {soloParentText || "___"} children in Barangay{" "}
                          {settings ? settings.barangay : "________________"}.
                        </Text>
                      </Text>
                      {/* Purpose in PDF */}
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
                          { textAlign: "justify", marginTop: 10 },
                        ]}
                      >
                        This certification is being issued upon request of the
                        interested party for record and reference purposes only.
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginTop: 6 },
                        ]}
                      >
                        Issued this{" "}
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
                  ) : (
                    <Text style={styles.bodyText}>
                      Please select a resident to view certificate.
                    </Text>
                  )}
                  <CertificateFooter
                    styles={styles}
                    captainName={captainName ?? ""}
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
