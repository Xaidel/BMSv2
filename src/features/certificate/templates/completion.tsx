import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ArrowLeftCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CertificateHeader from "../certificateHeader";
import { useOfficial } from "@/features/api/official/useOfficial";

export default function Completion() {
  const navigate = useNavigate();
  // State for new fields
  const [projectDescription, setProjectDescription] = useState("");
  const [location, setLocation] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [implementationType, setImplementationType] =
    useState("administration");
  const [notedBy, setNotedBy] = useState("ALVIN C. FEDERICO");
  const [notedByRole, setNotedByRole] = useState("Municipal Engineer");
  const [acceptedBy, setAcceptedBy] = useState("KERWIN M. DONACAO");
  const [acceptedByRole, setAcceptedByRole] = useState("Barangay Captain");

  const [openCalendarFrom, setOpenCalendarFrom] = useState(false);
  const [openCalendarTo, setOpenCalendarTo] = useState(false);
  const [openCalendarCompletion, setOpenCalendarCompletion] = useState(false);

  const { data: officials } = useOfficial();

  const filteredOfficials = useMemo(() => {
    if (!officials) return [];
    const list = Array.isArray(officials) ? officials : officials.officials;
    return list.filter(
      (official: any) =>
        !official.Role.toLowerCase().includes("sk") &&
        !official.Role.toLowerCase().includes("tanod")
    );
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
              Certificate of Completion
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for Certificate
              of Completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div className="mt-4">
                <label
                  htmlFor="project_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Description
                </label>
                <input
                  id="project_description"
                  type="text"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter project description"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter location"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="completion_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Completion Date
                </label>
                <Popover
                  open={openCalendarCompletion}
                  onOpenChange={setOpenCalendarCompletion}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-black">
                      {completionDate
                        ? format(new Date(completionDate), "PPP")
                        : "Pick a completion date"}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={
                        completionDate ? new Date(completionDate) : undefined
                      }
                      onSelect={(date) => {
                        if (date) setCompletionDate(date.toISOString());
                        setOpenCalendarCompletion(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="period_from"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Completion Period (From)
                  </label>
                  <Popover
                    open={openCalendarFrom}
                    onOpenChange={setOpenCalendarFrom}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-black">
                        {periodFrom
                          ? format(new Date(periodFrom), "PPP")
                          : "Pick a start date"}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={periodFrom ? new Date(periodFrom) : undefined}
                        onSelect={(date) => {
                          if (date) setPeriodFrom(date.toISOString());
                          setOpenCalendarFrom(false);
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="period_to"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Completion Period (To)
                  </label>
                  <Popover
                    open={openCalendarTo}
                    onOpenChange={setOpenCalendarTo}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-black">
                        {periodTo
                          ? format(new Date(periodTo), "PPP")
                          : "Pick an end date"}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={periodTo ? new Date(periodTo) : undefined}
                        onSelect={(date) => {
                          if (date) setPeriodTo(date.toISOString());
                          setOpenCalendarTo(false);
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Implementation Type
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="administration"
                      checked={implementationType === "administration"}
                      onChange={() => setImplementationType("administration")}
                      className="mr-1"
                    />
                    By administration
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="contract"
                      checked={implementationType === "contract"}
                      onChange={() => setImplementationType("contract")}
                      className="mr-1"
                    />
                    By contract
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="noted_by"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Noted by (Engineer)
                </label>
                <input
                  id="noted_by"
                  type="text"
                  value={notedBy}
                  onChange={(e) => setNotedBy(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  id="noted_by_role"
                  type="text"
                  value={notedByRole}
                  onChange={(e) => setNotedByRole(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm mt-2"
                  placeholder="Enter title"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="accepted_by"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Accepted by (Barangay Captain)
                </label>
                <Select
                  value={`${acceptedBy}::${acceptedByRole}`}
                  onValueChange={(value) => {
                    const [name, role] = value.split("::");
                    setAcceptedBy(name);
                    setAcceptedByRole(role);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an official" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOfficials.map((official) => (
                      <SelectItem
                        key={official.ID}
                        value={`${official.Name}::${official.Role}`}
                      >
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
                // Save logic here if needed
                toast.success("Certificate saved successfully!");
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
                    CERTIFICATE OF COMPLETION
                  </Text>
                  <>
                    {/* PROJECT DESCRIPTION */}
                    <Text
                      style={[
                        styles.bodyText,
                        { marginBottom: 6, marginTop: 6 },
                      ]}
                    >
                      PROJECT DESCRIPTION:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {projectDescription || "______________________________"}
                      </Text>
                    </Text>
                    <Text style={[styles.bodyText, { marginBottom: 6 }]}>
                      LOCATION:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {location || "______________________________"}
                      </Text>
                    </Text>
                    {/* By administration/contract */}
                    <Text
                      style={[
                        styles.bodyText,
                        { marginBottom: 10, marginLeft: 0 },
                      ]}
                    >
                      <Text style={{ fontWeight: "bold" }}>
                        {implementationType === "administration"
                          ? "(/) By administration   ( ) By Contract"
                          : "( ) By administration   (/) By Contract"}
                      </Text>
                    </Text>
                    {/* Certification of completion */}
                    <Text
                      style={[
                        styles.bodyText,
                        {
                          marginBottom: 12,
                          marginTop: 15,
                          textAlign: "justify",
                        },
                      ]}
                    >
                      This is to certify that the above-menttioned project is
                      100% completed as of{" "}
                      {completionDate
                        ? new Date(completionDate).toLocaleDateString()
                        : "________________________"}{" "}
                      covering the period from{" "}
                      {periodFrom
                        ? new Date(periodFrom).toLocaleDateString()
                        : "____________________"}{" "}
                      to{" "}
                      {periodTo
                        ? new Date(periodTo).toLocaleDateString()
                        : "____________________"}
                      , and that all works are done in accordance with the
                      approved plans and specifications.
                    </Text>
                    {/* Recommendation for payment */}
                    <Text
                      style={[
                        styles.bodyText,
                        {
                          marginTop: 12,
                          marginBottom: 12,
                          textAlign: "justify",
                        },
                      ]}
                    >
                      This is to certify further that the above-mentioned
                      project is hereby recommended for payment.
                    </Text>
                    {/* Accepted by and Noted by, side by side */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 16,
                        marginBottom: 10,
                      }}
                    >
                      {/* Accepted by (left) */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.bodyText,
                            { marginBottom: 2 },
                          ]}
                        >
                          <Text style={{ fontWeight: "bold" }}>Accepted by:</Text>
                        </Text>
                        <Text style={[styles.bodyText, { textAlign: "center", marginTop: 10 }]}>
                          <Text style={{ fontWeight: "bold" }}>
                            {acceptedBy ? `HON. ${acceptedBy}` : "____________________"}
                          </Text>
                        </Text>
                        <Text style={[styles.bodyText, { textAlign: "center", marginTop: 4 }]}>
                          {acceptedByRole || "____________________"}
                        </Text>
                      </View>
                      {/* Noted by (right) */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.bodyText,
                            { marginBottom: 2 },
                          ]}
                        >
                          <Text style={{ fontWeight: "bold" }}>Noted by:</Text>
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            { textAlign: "center", marginTop: 10 },
                          ]}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            {notedBy || "____________________"}
                          </Text>
                        </Text>
                        <Text
                          style={[
                            styles.bodyText,
                            { textAlign: "center", marginTop: 4 },
                          ]}
                        >
                          {notedByRole || "____________________"}
                        </Text>
                      </View>
                    </View>
                  </>
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  );
}
