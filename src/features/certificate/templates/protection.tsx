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
import { ArrowLeftCircleIcon, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useMemo, useState } from "react";
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
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";

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

export default function BarangayProtectionOrder() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  // const [captainName, setCaptainName] = useState<string | null>(null);
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
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [officialRole, setOfficialRole] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [respondentAddress, setRespondentAddress] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [attachmentText, setAttachmentText] = useState("");
  const [orderText, setOrderText] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [copyReceivedBy, setCopyReceivedBy] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [settings, setSettings] = useState<{
    barangay: string;
    municipality: string;
    province: string;
  } | null>(null);
  const [servedBy, setServedBy] = useState("");

  const [openCalendarApplication, setOpenCalendarApplication] = useState(false);


  // Go backend integration
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
              Barangay Protection Order
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Barangay Protection Order.
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
                  htmlFor="respondentName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name of Respondent
                </label>
                <input
                  id="respondentName"
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter respondent's full name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="respondentAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address of Respondent
                </label>
                <input
                  id="respondentAddress"
                  type="text"
                  value={respondentAddress}
                  onChange={(e) => setRespondentAddress(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter respondent's address"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="complainantName"
                  className="block text-sm text-gray-700 mb-1 font-bold"
                >
                  Name of Complainant
                </label>
                <input
                  id="complainantName"
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter complainant's full name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="applicationDate"
                  className="block text-sm text-gray-700 mb-1 font-bold"
                >
                  Date of Application
                </label>
                <Popover open={openCalendarApplication} onOpenChange={setOpenCalendarApplication}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-black">
                      {applicationDate
                        ? format(new Date(applicationDate), "PPP")
                        : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={applicationDate ? new Date(applicationDate) : undefined}
                      onSelect={(date) => {
                        if (date) setApplicationDate(date.toISOString());
                        setOpenCalendarApplication(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="attachmentText"
                  className="block text-sm text-gray-700 mb-1 font-bold"
                >
                  Statement / Attachment
                </label>
                <textarea
                  id="attachmentText"
                  value={attachmentText}
                  onChange={(e) => setAttachmentText(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter details of the complaint or statement under oath"
                  rows={3}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="orderText" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Text
                </label>
                <textarea
                  id="orderText"
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter the order text"
                  rows={4}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="solutionText" className="block text-sm font-medium text-gray-700 mb-1">
                  Solution Text
                </label>
                <textarea
                  id="solutionText"
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter the solution text"
                  rows={3}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="copyReceivedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Copy received by
                </label>
                <input
                  id="copyReceivedBy"
                  type="text"
                  value={copyReceivedBy}
                  onChange={(e) => setCopyReceivedBy(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter recipient name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="dateReceived"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date Received
                </label>
                <input
                  id="dateReceived"
                  type="date"
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="servedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Served by
                </label>
                <input
                  id="servedBy"
                  type="text"
                  value={servedBy}
                  onChange={(e) => setServedBy(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter server's name"
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
                  value={
                    assignedOfficial && officialRole
                      ? `${assignedOfficial}::${officialRole}`
                      : ""
                  }
                  onValueChange={(val) => {
                    const [name, role] = val.split("::");
                    setAssignedOfficial(name);
                    setOfficialRole(role);
                  }}
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
                        <SelectItem key={official.ID} value={`${official.Name}::${official.Role}`}>
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
                if (
                  !respondentName ||
                  !respondentAddress ||
                  !complainantName ||
                  !applicationDate ||
                  !attachmentText
                ) {
                  alert("Please fill out all the required fields.");
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
                    type_: "Barangay Protection Order",
                    issued_date: new Date().toISOString(),
                    respondent_name: respondentName,
                    respondent_address: respondentAddress,
                    complainant_name: complainantName,
                    application_date: applicationDate,
                    attachment_text: attachmentText,
                    order_text: orderText,
                    solution_text: solutionText,
                  };
                  await addCertificate(cert);
                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.Firstname} ${
                      selectedResident.Middlename
                        ? selectedResident.Middlename.charAt(0) + ". "
                        : ""
                    }${selectedResident.Lastname}'s BPO was saved.`,
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
                    BARANGAY PROTECTION ORDER
                  </Text>
                  {selectedResident ? (
                    <>
                      <Text style={[styles.bodyText, { marginBottom: 8 }]}>
                        NAME OF RESPONDENT: <Text style={{ fontWeight: "bold" }}>{respondentName || "________________"}</Text>
                      </Text>
                      <Text style={[styles.bodyText, { marginBottom: 8 }]}>
                        ADDRESS: <Text style={{ fontWeight: "bold" }}>{respondentAddress || "________________"}</Text>
                      </Text>
                      <Text style={{ fontWeight: "bold", fontSize: 16, marginVertical: 8, marginBottom: 8 }}>
                        ORDER
                      </Text>
                      <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 10 }]}>
                        <Text>
                          {complainantName ? (
                            <Text style={{ fontWeight: "bold" }}>{complainantName} </Text>
                          ) : (
                            <Text style={{ fontWeight: "bold" }}>________________ </Text>
                          )}
                          applied for a Barangay Protection Order (BPO) on{" "}
                          {applicationDate ? (
                            <Text style={{ fontWeight: "bold" }}>
                              {new Date(applicationDate).toLocaleDateString("en-PH", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </Text>
                          ) : (
                            <Text style={{ fontWeight: "bold" }}>______________</Text>
                          )}
                          {" "}under oath stating that{" "}
                          {attachmentText ? (
                            <Text style={{ fontWeight: "bold" }}>{attachmentText}</Text>
                          ) : (
                            <Text style={{ fontWeight: "bold" }}>________________</Text>
                          )}
                          .
                        </Text>
                      </Text>
                      <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 10 }]}>
                        {orderText
                          ? orderText
                          : "After due hearing and in accordance with Section 409 of the Local Government Code of 1991 (RA 7160), the undersigned finds merit in the application and hereby issues this BARANGAY PROTECTION ORDER (BPO) ordering the respondent to CEASE AND DESIST from committing or threatening to commit further acts of violence or harassment against the complainant and/or any member of the household."}
                      </Text>
                      <Text style={[styles.bodyText, { textAlign: "justify", marginBottom: 10 }]}>
                        {solutionText
                          ? solutionText
                          : `The respondent is prohibited from approaching or causing any person to approach the complainant at a distance of not less than 100 meters at any place at any time. This order is effective for fifteen (15) days from the date of issuance.`}
                      </Text>
                      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                        VIOLATION OF THIS ORDER IS PUNISHABLE BY LAW.
                      </Text>
                      <Text style={[styles.bodyText, { marginTop: 16, marginBottom: 6 }]}>
                        Issued this{" "}
                        {new Date().toLocaleDateString("en-PH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}, at {settings ? settings.barangay : "________________"}
                        , {settings ? settings.municipality : "________________"}
                        , {settings ? settings.province : "________________"}
                      </Text>
                      <View style={{ marginTop: 30 }}>
                        <Text style={{ fontSize: 18, textAlign: "right", fontWeight: "bold" }}>
                          HON. {assignedOfficial || "________________"}
                        </Text>
                        <Text style={{ textAlign: "right", fontSize: 18 }}>
                          {officialRole || "________________"}
                        </Text>
                      </View>
                      <View style={{ fontSize: 14, marginTop: 20 }}>
                        <Text style={{ marginBottom: 0, fontSize: 14 }}>
                          Copy received by: <Text style={{ fontWeight: "bold" }}>{copyReceivedBy || "__________________________"}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontStyle: "italic",
                            marginBottom: 6,
                            marginLeft: 2,
                          }}
                        >
                          (Signature over printed name)
                        </Text>
                        <Text style={{ marginBottom: 4, fontSize: 14 }}>
                          Date Received:{" "}
                          {dateReceived
                            ? new Date(dateReceived).toLocaleDateString("en-PH", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "__________________________"}
                        </Text>
                        <Text style={{ marginBottom: 0, fontSize: 14 }}>
                          Served by: <Text style={{ fontWeight: "bold" }}>{servedBy || "__________________________"}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontStyle: "italic",
                            marginBottom: 6,
                            marginLeft: 2,
                          }}
                        >
                          (Signature over printed name)
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.bodyText}>
                      Please select a resident to view certificate.
                    </Text>
                  )}
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  );
}