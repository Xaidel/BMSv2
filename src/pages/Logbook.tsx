import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {Trash, CalendarPlus, CalendarCheck, CalendarX2, CalendarClock,} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Logbook } from "@/types/types";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { LogbookPDF } from "@/components/pdf/logbook";
import SummaryCardLogbook from "@/components/summary-card/logbook";
import AddLogbookModal from "@/features/logbook/addLogbookModal";
import DeleteLogbookModal from "@/features/logbook/deleteLogbookModal";
import ViewLogbookModal from "@/features/logbook/viewLogbookModal";
import { logbookSort } from "@/service/logbook/logbookSort";
import searchLogbook from "@/service/logbook/searchLogbook";

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
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="flex items-center justify-center"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="flex items-center justify-center"
      />
    ),
  },
  {
    header: "Official Name",
    accessorKey: "official_name",
  },
  {
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => {
      return <div>{format(row.original.date, "MMMM d, yyyy")}</div>;
    },
  },
  {
    header: "In AM",
    accessorKey: "time_in_am",
    cell: ({ row }) => {
      const timeValue = row.original.time_in_am;
      if (!timeValue) return null;
      return (
        <div>{format(new Date("1970-01-01T" + timeValue), "hh:mm a")}</div>
      );
    },
  },
  {
    header: "Out AM",
    accessorKey: "time_out_am",
    cell: ({ row }) => {
      const timeValue = row.original.time_out_am;
      if (!timeValue) return null;
      return (
        <div>{format(new Date("1970-01-01T" + timeValue), "hh:mm a")}</div>
      );
    },
  },
  {
    header: "In PM",
    accessorKey: "time_in_pm",
    cell: ({ row }) => {
      const timeValue = row.original.time_in_pm;
      if (!timeValue) return null;
      return (
        <div>{format(new Date("1970-01-01T" + timeValue), "hh:mm a")}</div>
      );
    },
  },
  {
    header: "Out PM",
    accessorKey: "time_out_pm",
    cell: ({ row }) => {
      const timeValue = row.original.time_out_pm;
      if (!timeValue) return null;
      return (
        <div>{format(new Date("1970-01-01T" + timeValue), "hh:mm a")}</div>
      );
    },
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
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
    accessorKey: "total_hours",
    cell: ({ row }) => {
      const hours = row.original.total_hours;
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
  const [data, setData] = useState<Logbook[]>([]);
  const fetchLogbookEntries = () => {
    invoke<Logbook[]>("fetch_all_logbook_entries_command")
      .then((fetched) => {
        const parsed = fetched.map((entry) => {
          const dateObj = new Date(entry.date);
          const amHours = calculateHours(entry.time_in_am, entry.time_out_am);
          const pmHours = calculateHours(entry.time_in_pm, entry.time_out_pm);
          const totalHours = amHours + pmHours;
          const today = new Date();
          const isBeforeToday =
            dateObj.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
          let status = entry.status;
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
            date: dateObj,
            total_hours: totalHours,
            status,
          };
        });
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch logbook entries:", err));
  };

  useEffect(() => {
    fetchLogbookEntries();
  }, []);

  <AddLogbookModal onSave={fetchLogbookEntries} />;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = logbookSort(
      data,
      searchParams.get("sort") ?? "All Logbook Entries"
    );

    if (searchQuery.trim()) {
      return searchLogbook(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, data, searchQuery]);

  const total = data.length;

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      toast.error("No logbook entries selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_logbook_entry_command", { id });
        }
      }
      toast.success("Selected logbook entries deleted.");
      fetchLogbookEntries(); // Refresh the table
      setRowSelection({}); // Reset selection
    } catch (err) {
      toast.error("Failed to delete selected logbook entries");
      console.error("Delete error:", err);
    }
  };
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardLogbook
          title="Total Logbook Entries"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <LogbookPDF filter="All Logbook Entries" logbook={data} />
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
            data.filter((entry) => {
              const today = new Date();
              return (
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarPlus size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = data.filter(
              (entry) =>
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
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
            data.filter((entry) => {
              const today = new Date();
              return (
                entry.status === "Absent" &&
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarX2 size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = data.filter(
              (entry) =>
                entry.status === "Absent" &&
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
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
            data.filter((entry) => {
              const today = new Date();
              return (
                entry.status === "Full Day" &&
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
              );
            }).length
          }
          icon={<CalendarCheck size={50} />}
          onClick={async () => {
            const today = new Date();
            const filtered = data.filter(
              (entry) =>
                entry.status === "Full Day" &&
                entry.date.getFullYear() === today.getFullYear() &&
                entry.date.getMonth() === today.getMonth() &&
                entry.date.getDate() === today.getDate()
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
          disabled={Object.keys(rowSelection).length === 0}
          onClick={handleDeleteSelected}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddLogbookModal onSave={fetchLogbookEntries} />
      </div>

      <DataTable<Logbook>
        classname="py-5"
        height="43.3rem"
        data={filteredData}
        columns={[
          ...columns,
          {
            id: "view",
            header: "",
            cell: ({ row }) => {
              const status = row.original.status;
              return (
                <div className="flex gap-3">
                  <ViewLogbookModal
                    {...row.original}
                    onSave={fetchLogbookEntries}
                  />
                  {status !== "Ongoing" &&
                    status !== "Half Day" &&
                    status !== "Full Day" && (
                      <DeleteLogbookModal
                        {...row.original}
                        date={row.original.date.toISOString()}
                        onDelete={fetchLogbookEntries}
                      />
                    )}
                </div>
              );
            },
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </>
  );
}
