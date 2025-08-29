import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Trash,
  CalendarPlus,
  CalendarCheck,
  CalendarX2,
  CalendarClock,
  Eye,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Logbook } from "@/types/apitypes";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { LogbookPDF } from "@/components/pdf/logbook";
import SummaryCardLogbook from "@/components/summary-card/logbook";
import AddLogbookModal from "@/features/logbook/addLogbookModal";
import ViewLogbookModal from "@/features/logbook/viewLogbookModal";
import { sort } from "@/service/logbook/logbookSort";
import searchLogbook from "@/service/logbook/searchLogbook";
import { useLogbook } from "@/features/api/logbook/useLogbook";
import { useDeleteLogbook } from "@/features/api/logbook/useDeleteLogbok";

const filters = [
  "All Logbook Entries",
  "Date ASC",
  "Date DESC",
  "Ongoing",
  "Half Day",
  "Absent",
  "Status",
  "Active Today",
  "This Month",
];

const columns: ColumnDef<Logbook>[] = [

  {
    header: "Official Name",
    accessorKey: "Name",
  },
  {
    header: "Date",
    accessorKey: "Date",
    cell: ({ row }) => {
      try {
        const dateValue = row.original.Date;
        const dateObj =
          dateValue instanceof Date ? dateValue : new Date(dateValue);
        if (isNaN(dateObj.getTime())) return <div>Invalid Date</div>;
        return <div>{format(dateObj, "MMMM d, yyyy")}</div>;
      } catch {
        return <div>Invalid Date</div>;
      }
    },
  },
  {
    header: "In AM",
    accessorKey: "TimeInAm",
    cell: ({ row }) => {
      const timeValue = row.original.TimeInAm;
      if (!timeValue) return null;
      try {
        const parts = timeValue.split(":");
        if (parts.length < 2) return <div>Invalid Time</div>;
        const [h, m] = parts;
        const safeTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        const dateObj = new Date(`1970-01-01T${safeTime}`);
        if (isNaN(dateObj.getTime())) return <div>Invalid Time</div>;
        return <div>{format(dateObj, "hh:mm a")}</div>;
      } catch {
        return <div>Invalid Time</div>;
      }
    },
  },
  {
    header: "Out AM",
    accessorKey: "TimeOutAm",
    cell: ({ row }) => {
      const timeValue = row.original.TimeOutAm;
      if (!timeValue) return null;
      try {
        const parts = timeValue.split(":");
        if (parts.length < 2) return <div>Invalid Time</div>;
        const [h, m] = parts;
        const safeTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        const dateObj = new Date(`1970-01-01T${safeTime}`);
        if (isNaN(dateObj.getTime())) return <div>Invalid Time</div>;
        return <div>{format(dateObj, "hh:mm a")}</div>;
      } catch {
        return <div>Invalid Time</div>;
      }
    },
  },
  {
    header: "In PM",
    accessorKey: "TimeInPm",
    cell: ({ row }) => {
      const timeValue = row.original.TimeInPm;
      if (!timeValue) return null;
      try {
        const parts = timeValue.split(":");
        if (parts.length < 2) return <div>Invalid Time</div>;
        const [h, m] = parts;
        const safeTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        const dateObj = new Date(`1970-01-01T${safeTime}`);
        if (isNaN(dateObj.getTime())) return <div>Invalid Time</div>;
        return <div>{format(dateObj, "hh:mm a")}</div>;
      } catch {
        return <div>Invalid Time</div>;
      }
    },
  },
  {
    header: "Out PM",
    accessorKey: "TimeOutPm",
    cell: ({ row }) => {
      const timeValue = row.original.TimeOutPm;
      if (!timeValue) return null;
      try {
        const parts = timeValue.split(":");
        if (parts.length < 2) return <div>Invalid Time</div>;
        const [h, m] = parts;
        const safeTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        const dateObj = new Date(`1970-01-01T${safeTime}`);
        if (isNaN(dateObj.getTime())) return <div>Invalid Time</div>;
        return <div>{format(dateObj, "hh:mm a")}</div>;
      } catch {
        return <div>Invalid Time</div>;
      }
    },
  },
  {
    header: "Remarks",
    accessorKey: "Remarks",
  },
  {
    header: "Status",
    accessorKey: "Status",
    cell: ({ row }) => {
      const status = row.original.Status;
      let color: string;
      if (status === "Absent") {
        color = "red";
      } else if (status === "Ongoing" || status === "Half Day") {
        color = "orange";
      } else if (status === "Full Day") {
        color = "green";
      }
      return <div style={{ color }}>{status}</div>;
    },
  },
  {
    header: "Total Hours",
    accessorKey: "TotalHours",
    cell: ({ row }) => {
      const hours = row.original.TotalHours;
      return <div>{hours !== undefined ? hours.toFixed(2) + " hrs" : ""}</div>;
    },
  },
];

function calculateHours(timeIn?: string, timeOut?: string): number {
  if (!timeIn || !timeOut) return 0;
  const [inHours, inMinutes] = timeIn.split(":").map(Number);
  const [outHours, outMinutes] = timeOut.split(":").map(Number);
  let inTotal = inHours + inMinutes / 60;
  let outTotal = outHours + outMinutes / 60;
  let diff = outTotal - inTotal;
  if (diff < 0) diff = 0;
  return diff;
}

export default function LogbookPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogbook, setSelectedLogbook] = useState<number[]>([]);
  const { data: logbookResponse } = useLogbook();
  const { mutateAsync: deleteLogbook } = useDeleteLogbook();

  const logbook = useMemo(() => {
    const fetched = logbookResponse?.logbooks ?? [];
    const parsed = fetched.map((entry) => {
      const dateObj = new Date(entry.Date);
      const amHours = calculateHours(entry.TimeInAm, entry.TimeOutAm);
      const pmHours = calculateHours(entry.TimeInPm, entry.TimeOutPm);
      const totalHours = amHours + pmHours;
      const today = new Date();
      const isBeforeToday =
        dateObj.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
      let status = entry.Status;
      if (isBeforeToday) {
        if (totalHours >= 7) {
          status = "Full Day";
        } else if (totalHours >= 3.5) {
          status = "Half Day";
        } else if (totalHours === 0) {
          status = "Absent";
        }
      }
      return {
        ...entry,
        Date: dateObj,
        TotalHours: totalHours,
        Status: status,
      };
    });
    return parsed;
  }, [logbookResponse]);

  const total = logbook.length;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(logbook, searchParams.get("sort") ?? "All Logbook");
    if (searchQuery.trim()) {
      return searchLogbook(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, logbook, searchQuery]);
  
  const [viewLogbookId, setViewLogbookId] = useState<number | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardLogbook
          title="Total Logbook Entries"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <LogbookPDF filter="All Logbook Entries" logbook={filteredData} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("LogbookRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Logbook Record successfully downloaded", {
                description: "Logbook record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Logbook record",
              });
            }
          }}
        />
        <SummaryCardLogbook
          title="Active Today"
          value={
            logbook.filter((entry) => {
              const today = new Date();
              return (
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarPlus size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = logbook.filter(
              (entry) =>
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
            );
            const blob = await pdf(
              <LogbookPDF filter="Active Today" logbook={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ActiveTodayLogbook.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Active Today logbook PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Active Today logbook PDF",
              });
            }
          }}
        />
        <SummaryCardLogbook
          title="Absent Today"
          value={
            logbook.filter((entry) => {
              const today = new Date();
              return (
                entry.Status === "Absent" &&
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarX2 size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = logbook.filter(
              (entry) =>
                entry.Status === "Absent" &&
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
            );
            const blob = await pdf(
              <LogbookPDF filter="Absent Today" logbook={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("AbsentTodayLogbook.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Absent Today logbook PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Absent Today logbook PDF",
              });
            }
          }}
        />
        <SummaryCardLogbook
          title="Present Today"
          value={
            logbook.filter((entry) => {
              const today = new Date();
              return (
                entry.Status === "Full Day" &&
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarCheck size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = logbook.filter(
              (entry) =>
                entry.Status === "Full Day" &&
                entry.Date.getFullYear() === today.getFullYear() &&
                entry.Date.getMonth() === today.getMonth() &&
                entry.Date.getDate() === today.getDate()
            );
            const blob = await pdf(
              <LogbookPDF filter="Present Today" logbook={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("PresentTodayLogbook.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Present Today logbook PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Present Today logbook PDF",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={handleSearch}
          placeholder="Search Logbook Entry"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Logbook Entries"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={selectedLogbook.length === 0}
          onClick={() => {
            if (selectedLogbook.length > 0) {
              toast.promise(deleteLogbook(selectedLogbook), {
                loading: "Deleting selected logbooks. Please wait",
                success: () => {
                  setSelectedLogbook([]);
                  setRowSelection({});
                  return {
                    message: "Selected logbooks deleted successfully",
                  };
                },
                error: () => {
                  return {
                    message: "Failed to delete selected logbooks",
                  };
                },
              });
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddLogbookModal onSave={() => {}} />
      </div>

      {/* Data Table */}
      <DataTable<Logbook>
        classname="py-5"
        height="43.3rem"
        data={filteredData}
        columns={[
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected()
                    ? true
                    : table.getIsSomePageRowsSelected()
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={(value) => {
                  table.toggleAllPageRowsSelected(!!value);
                  if (value) {
                    const allVisibleRows = table
                      .getRowModel()
                      .rows.map((row) => row.original.ID);
                    setSelectedLogbook(allVisibleRows);
                  } else {
                    setSelectedLogbook([]);
                  }
                }}
                aria-label="Select all"
                className="flex items-center justify-center"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                  row.toggleSelected(!!value);
                  if (value) {
                    setSelectedLogbook((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedLogbook((prev) =>
                      prev.filter((logbook) => logbook !== row.original.ID)
                    );
                  }
                }}
                aria-label="Select row"
                className="flex items-center justify-center"
              />
            ),
          },
          ...columns,
          {
            id: "view",
            header: "",
            cell: ({ row }) => (
              <Button onClick={() => setViewLogbookId(row.original.ID)}>
                <Eye /> View More
              </Button>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={(selected) => {
          setRowSelection(selected);
          const selectedIds = Object.keys(selected)
            .filter((key) => selected[key])
            .map((key) => Number(key));
          setSelectedLogbook(selectedIds);
        }}
      />
      {viewLogbookId !== null && (
        <ViewLogbookModal
          logbook={logbook.find((e) => e.ID === viewLogbookId) ?? null}
          open={true}
          onClose={() => setViewLogbookId(null)}
        />
      )}
    </>
  );
}
