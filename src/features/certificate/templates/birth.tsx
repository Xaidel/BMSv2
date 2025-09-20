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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect } from "react";
import { Image } from "@react-pdf/renderer";
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";
import { ArrowLeftCircleIcon, ChevronsUpDown, Check } from "lucide-react";
import CertificateHeader from "../certificateHeader";
import { Buffer } from "buffer";
if (!window.Buffer) {
  window.Buffer = Buffer;
}

type Resident = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  age?: number;
  civil_status?: string;
};

export default function Birth() {
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
  const preparedBy = getOfficialName("secretary", "barangay officials");
  const navigate = useNavigate();
  // Birth certificate form fields
  const [registryNo, setRegistryNo] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [childFirstName, setChildFirstName] = useState("");
  const [childMiddleName, setChildMiddleName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childDateOfBirth, setChildDateOfBirth] = useState("");
  const [childWeight, setChildWeight] = useState("");
  const [age, setAge] = useState("");
  const [typeOfBirth, setTypeOfBirth] = useState("");
  const [totalNumberOfChild, setTotalNumberOfChild] = useState("");
  const [timeAtBirth, setTimeAtBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [motherMaidenName, setMotherMaidenName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherAge, setMotherAge] = useState("");
  const [motherResidence, setMotherResidence] = useState("");
  const [motherReligion, setMotherReligion] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherAge, setFatherAge] = useState("");
  const [fatherResidence, setFatherResidence] = useState("");
  const [fatherReligion, setFatherReligion] = useState("");
  const [dateOfMarriage, setDateOfMarriage] = useState("");
  const [placeOfMarriage, setPlaceOfMarriage] = useState("");
  const [attendantAtBirth, setAttendantAtBirth] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoMunicipalityDataUrl, setLogoMunicipalityDataUrl] = useState<
    string | null
  >(null);
  const [, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);
  console.log(age);
  // Resident selector state for Select Resident dropdown
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState("");
  const allResidents = useMemo(() => {
    return residents.map((res) => ({
      value: `${res.first_name} ${res.last_name}`.toLowerCase(),
      label: `${res.first_name} ${res.last_name}`,
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

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            barangay: res.setting.Barangay || "",
            municipality: res.setting.Municipality || "",
            province: res.setting.Province || "",
          });
          if (res.setting.ImageB) {
            setLogoDataUrl(res.setting.ImageB);
          }
          if (res.setting.ImageM) {
            setLogoMunicipalityDataUrl(res.setting.ImageM);
          }
        }
      })
      .catch(console.error);

    getResident()
      .then((res) => {
        if (Array.isArray(res.residents)) {
          setResidents(
            res.residents.map((r) => ({
              id: r.ID,
              first_name: r.Firstname,
              middle_name: r.Middlename,
              last_name: r.Lastname,
              suffix: r.Suffix,
              age: r.Birthday
                ? new Date().getFullYear() - new Date(r.Birthday).getFullYear()
                : undefined,
              civil_status: r.CivilStatus,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  // Populate related fields when a resident is selected
  useEffect(() => {
    if (selectedResident) {
      if ("age" in selectedResident) setAge(String(selectedResident.age ?? ""));
      if ("civil_status" in selectedResident)
        setCivilStatus(selectedResident.civil_status ?? "");
    }
  }, [selectedResident]);
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
              Birth Certificate
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Birth
              Registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {/* Resident Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Resident
                </label>
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
              {/* Birth Certificate Fields */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registry No.
                  </label>
                  <input
                    type="text"
                    value={registryNo || ""}
                    onChange={(e) => setRegistryNo(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 2023-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={birthDate || ""}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 2023-01-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of child (First)
                  </label>
                  <input
                    type="text"
                    value={childFirstName || ""}
                    onChange={(e) => setChildFirstName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of child (Middle)
                  </label>
                  <input
                    type="text"
                    value={childMiddleName || ""}
                    onChange={(e) => setChildMiddleName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Dela"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of child (Last)
                  </label>
                  <input
                    type="text"
                    value={childLastName || ""}
                    onChange={(e) => setChildLastName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Cruz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={childGender || ""}
                    onChange={(e) => setChildGender(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Male"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={childDateOfBirth || ""}
                    onChange={(e) => setChildDateOfBirth(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 2023-01-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight at Birth
                  </label>
                  <input
                    type="text"
                    value={childWeight || ""}
                    onChange={(e) => setChildWeight(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 3.2 kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Birth
                  </label>
                  <input
                    type="text"
                    value={typeOfBirth || ""}
                    onChange={(e) => setTypeOfBirth(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Single"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Number of Child
                  </label>
                  <input
                    type="number"
                    value={totalNumberOfChild || ""}
                    onChange={(e) => setTotalNumberOfChild(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time at Birth
                  </label>
                  <input
                    type="text"
                    value={timeAtBirth || ""}
                    onChange={(e) => setTimeAtBirth(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 2:15 AM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={placeOfBirth || ""}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Barangay Health Center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother Maiden Name
                  </label>
                  <input
                    type="text"
                    value={motherMaidenName || ""}
                    onChange={(e) => setMotherMaidenName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Maria Santos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother Occupation
                  </label>
                  <input
                    type="text"
                    value={motherOccupation || ""}
                    onChange={(e) => setMotherOccupation(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Teacher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother Age
                  </label>
                  <input
                    type="number"
                    value={motherAge || ""}
                    onChange={(e) => setMotherAge(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother Residence
                  </label>
                  <input
                    type="text"
                    value={motherResidence || ""}
                    onChange={(e) => setMotherResidence(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Purok 2, Barangay Mabini"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother Religion
                  </label>
                  <input
                    type="text"
                    value={motherReligion || ""}
                    onChange={(e) => setMotherReligion(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Roman Catholic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={fatherName || ""}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Jose Cruz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Occupation
                  </label>
                  <input
                    type="text"
                    value={fatherOccupation || ""}
                    onChange={(e) => setFatherOccupation(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Farmer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Age
                  </label>
                  <input
                    type="number"
                    value={fatherAge || ""}
                    onChange={(e) => setFatherAge(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Residence
                  </label>
                  <input
                    type="text"
                    value={fatherResidence || ""}
                    onChange={(e) => setFatherResidence(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Purok 2, Barangay Mabini"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Religion
                  </label>
                  <input
                    type="text"
                    value={fatherReligion || ""}
                    onChange={(e) => setFatherReligion(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Roman Catholic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Marriage
                  </label>
                  <input
                    type="date"
                    value={dateOfMarriage || ""}
                    onChange={(e) => setDateOfMarriage(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 2010-06-15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Marriage
                  </label>
                  <input
                    type="text"
                    value={placeOfMarriage || ""}
                    onChange={(e) => setPlaceOfMarriage(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. San Roque Church"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendant at Birth
                  </label>
                  <input
                    type="text"
                    value={attendantAtBirth || ""}
                    onChange={(e) => setAttendantAtBirth(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Dr. Ana Reyes"
                  />
                </div>
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
                  value={amount || ""}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g. 10.00"
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              onClick={async () => {
                if (!selectedResident) {
                  alert("Please select a resident first.");
                  return;
                }
                try {
                  const { mutateAsync: addCertificate } = useAddCertificate();
                  await addCertificate({
                    ResidentID: selectedResident.id,
                    ResidentName: `${selectedResident.first_name} ${
                      selectedResident.middle_name
                        ? selectedResident.middle_name.charAt(0) + ". "
                        : ""
                    }${selectedResident.last_name}`,
                    Type: "Birth Certificate",
                    IssuedDate: new Date().toISOString().split("T")[0],
                    Age: selectedResident?.age ?? undefined,
                    CivilStatus: civilStatus || "",
                    OwnershipText: "",
                    Amount: amount ? parseFloat(amount) : 0,
                  });
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
                  {logoMunicipalityDataUrl && (
                    <Image
                      src={logoMunicipalityDataUrl}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 30,
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
                      CERTIFICATE OF BIRTH
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bodyText}>
                          Registry No.: {registryNo}
                        </Text>
                        <Text style={styles.bodyText}>Date: {birthDate}</Text>
                        <Text style={styles.bodyText}>
                          Name of Child: {childFirstName} {childMiddleName}{" "}
                          {childLastName}
                        </Text>
                        <Text style={styles.bodyText}>
                          Gender: {childGender}
                        </Text>
                        <Text style={styles.bodyText}>
                          Date of Birth: {childDateOfBirth}
                        </Text>
                        <Text style={styles.bodyText}>
                          Weight at Birth: {childWeight}
                        </Text>
                        <Text style={styles.bodyText}>
                          Type of Birth: {typeOfBirth}
                        </Text>
                        <Text style={styles.bodyText}>
                          Total Number of Child: {totalNumberOfChild}
                        </Text>
                        <Text style={styles.bodyText}>
                          Time at Birth: {timeAtBirth}
                        </Text>
                        <Text style={styles.bodyText}>
                          Place of Birth: {placeOfBirth}
                        </Text>
                        <Text style={styles.bodyText}>
                          Attendant at Birth: {attendantAtBirth}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bodyText}>
                          Mother Maiden Name: {motherMaidenName}
                        </Text>
                        <Text style={styles.bodyText}>
                          Occupation: {motherOccupation}
                        </Text>
                        <Text style={styles.bodyText}>
                          Age at Time of Birth: {motherAge}
                        </Text>
                        <Text style={styles.bodyText}>
                          Residence: {motherResidence}
                        </Text>
                        <Text style={styles.bodyText}>
                          Religion: {motherReligion}
                        </Text>
                        <Text style={styles.bodyText}>
                          Name of Father: {fatherName}
                        </Text>
                        <Text style={styles.bodyText}>
                          Occupation: {fatherOccupation}
                        </Text>
                        <Text style={styles.bodyText}>
                          Age at Time of Birth: {fatherAge}
                        </Text>
                        <Text style={styles.bodyText}>
                          Residence: {fatherResidence}
                        </Text>
                        <Text style={styles.bodyText}>
                          Religion: {fatherReligion}
                        </Text>
                        <Text style={styles.bodyText}>
                          Date of Marriage: {dateOfMarriage}
                        </Text>
                        <Text style={styles.bodyText}>
                          Place of Marriage: {placeOfMarriage}
                        </Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                      <Text
                        style={[
                          styles.bodyText,
                          { fontWeight: "bold", marginBottom: 6 },
                        ]}
                      >
                        REQUIREMENTS:
                      </Text>
                      {[
                        "Negative Certification of Birth issued by National Statistics Office.",
                        "Voters Certification issued by COMELEC.",
                        "Passport , NBI Clearance , Police Clearance , SSS / Service Records , I.D.",
                        "School Record ( stated the name , birth date & birth place )",
                        "Affidavit of 2 disinterested person.",
                        "Barangay Certification (stated the name , Birthdate /Birth place)",
                        "Baptismal Certificate",
                        "Cedula",
                        "Marriage Certificate of Parents",
                        "Cenomar of Parents",
                        "Affidavit of Legitimation.",
                        "Affidavit to use surname of the Father/Affidavit of Acknowledgement of Paternity (not married parent)",
                      ].map((req) => (
                        <Text key={req} style={styles.bodyText}>
                          • {req}
                        </Text>
                      ))}
                    </View>

                    <View
                      style={{
                        marginTop: 30,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
                          Prepared by:
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            {
                              marginTop: 20,
                              marginBottom: 4,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {preparedBy || "________________"}
                        </Text>
                        <Text style={styles.bodyText}>Barangay Secretary</Text>
                        <View style={{ marginTop: 20 }}>
                          <Text style={styles.bodyText}>
                            O.R. No.: ____________________
                          </Text>
                          <Text style={styles.bodyText}>
                            Date: _________________________
                          </Text>
                          <Text style={styles.bodyText}>
                            Amount: PHP {amount}
                          </Text>
                        </View>
                      </View>
                      <View>
                        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
                          Noted:
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            {
                              marginTop: 20,
                              marginBottom: 4,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          HON. {captainName || "________________"}
                        </Text>
                        <Text style={styles.bodyText}>Barangay Captain</Text>
                        {assignedOfficial && (
                          <View style={{ marginTop: 20 }}>
                            <Text
                              style={[
                                styles.bodyText,
                                { marginBottom: 4, fontWeight: "bold" },
                              ]}
                            >
                              HON. {assignedOfficial}
                            </Text>
                            <Text style={styles.bodyText}>
                              Officer in charge today
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
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
