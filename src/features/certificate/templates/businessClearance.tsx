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
import { Image } from "@react-pdf/renderer";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeftCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CertificateFooter from "../certificateFooter";

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
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [amount, setAmount] = useState("150.00");
  // Resident selection state
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  // Captain name state
  const [captainName, setCaptainName] = useState<string | null>(null);

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

    invoke("fetch_all_officials_command")
      .then((data) => {
        const captain = (data as any[]).find(
          (person) =>
            person.section?.toLowerCase() === "barangay officials" &&
            person.role?.toLowerCase() === "barangay captain"
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
            <div className="grid gap-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label>Type of Business</Label>
                <Input
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Enter type of business"
                />
              </div>
              <div>
                <Label>Business Location</Label>
                <Input
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="Enter business location"
                />
              </div>
              <div>
                <Label>Owner</Label>
                <Input
                  value={businessOwner}
                  onChange={(e) => setBusinessOwner(e.target.value)}
                  placeholder="Enter owner's name"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 150.00)"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-2">
            <div className="flex-1 flex justify-start">
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
                    const nowIso = new Date().toISOString();
                    await invoke("save_certificate_command", {
                      cert: {
                        resident_name: `${selectedResident.first_name} ${selectedResident.last_name}`,
                        id: 0,
                        type_: "Barangay Business Clearance",
                        issued_date: nowIso,
                        age: age ? parseInt(age) : undefined,
                        civil_status: civilStatus || "",
                        ownership_text: businessOwner || "",
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
            </div>
            <div className="flex-1 flex justify-end"></div>
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
                        height: 90,
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
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: "center" }}>
                          Republic of the Philippines
                        </Text>
                        <Text style={{ textAlign: "center" }}>
                          Province of {settings?.province || "Province"}
                        </Text>
                        <Text style={{ textAlign: "center" }}>
                          Municipality of{" "}
                          {settings?.municipality || "Municipality"}
                        </Text>
                        <Text
                          style={{
                            textAlign: "center",
                            marginTop: 10,
                            marginBottom: 10,
                          }}
                        >
                          BARANGAY{" "}
                          {settings?.barangay?.toUpperCase() || "Barangay"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 10,
                      }}
                    >
                      OFFICE OF THE PUNONG BARANGAY
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 10,
                      }}
                    >
                      BARANGAY BUSINESS CLEARANCE
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
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        This Barangay Business Clearance is not valid without
                        the signature of the Punong Barangay.
                      </Text>
                    </>
                    <CertificateFooter
                      styles={styles}
                      captainName={captainName}
                      amount={amount}
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
