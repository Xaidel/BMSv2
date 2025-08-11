import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import SummaryCardEvent from "@/components/summary-card/event";
import AddEventModal from "@/features/event/addEventModal";
import DeleteEventModal from "@/features/event/deleteEventModal";
import ViewEventModal from "@/features/event/viewEventModal";
import { sort } from "@/service/event/eventSort";
import searchEvent from "@/service/event/searchEvent";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Trash,
  CalendarPlus,
  CalendarCheck,
  CalendarX2,
  CalendarClock,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";


const filters = [
  "All Events",
  "Date ASC",
  "Date DESC",
  "Venue",
  "Upcoming",
  "Ongoing",
  "Finished",
  "Cancelled",
];

type Event = {
  id: number;
  name: string;
  type_: string;
  status: "Upcoming" | "Finished" | "Ongoing" | "Cancelled";
  date: Date;
  venue: string;
  attendee: string;
  notes: string;
};

const columns: ColumnDef<Event>[] = [
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
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "type_",
  },
  {
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => {
      return <div>{format(row.original.date, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Venue",
    accessorKey: "venue",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color: string;
      switch (status) {
        case "Upcoming": {
          color = "#BD0000";
          break;
        }
        case "Ongoing": {
          color = "#00BD29";
          break;
        }
        case "Cancelled": {
          color = "#000000";
          break;
        }
        case "Finished": {
          color = "#FFB30F";
          break;
        }
        default: {
          color = "#000000";
        }
      }
      return <div style={{ color: color }}>{status}</div>;
    },
  },
];

export default function Events() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Event[]>([]);
  const fetchEvents = () => {
    invoke<Event[]>("fetch_all_events_command")
      .then((fetched) => {
        const parsed = fetched.map((event) => ({
          ...event,
          date: new Date(event.date),
        }));
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  <AddEventModal onSave={fetchEvents} />;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = sort(data, searchParams.get("sort") ?? "All Events");

    if (searchQuery.trim()) {
      return searchEvent(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, data, searchQuery]);

  const total = data.length;
  const finished = data.filter((d) => d.status === "Finished").length;
  const upcoming = data.filter((d) => d.status === "Upcoming").length;
  const cancelled = data.filter((d) => d.status === "Cancelled").length;

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      toast.error("No events selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_event_command", { id });
        }
      }
      toast.success("Selected events deleted.");
      fetchEvents(); // Refresh the table
      setRowSelection({}); // Reset selection
    } catch (err) {
      toast.error("Failed to delete selected events");
      console.error("Delete error:", err);
    }
  };


  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardEvent
          title="Total Events"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const { pdf } = await import("@react-pdf/renderer");
            const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
            const { toast } = await import("sonner");
            const { EventPDF } = await import("@/components/pdf/eventpdf");

            const blob = await pdf(<EventPDF filter="All Events" events={data} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("EventRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Event Record successfully downloaded", {
                description: "Event record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Event record",
              });
            }
          }}
        />
        <SummaryCardEvent
          title="Upcoming Events"
          value={upcoming}
          icon={<CalendarPlus size={50} />}
          onClick={async () => {
            const filtered = data.filter((d) => d.status === "Upcoming");
            const { pdf } = await import("@react-pdf/renderer");
            const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
            const { toast } = await import("sonner");
            const { EventPDF } = await import("@/components/pdf/eventpdf");

            const blob = await pdf(<EventPDF filter="Upcoming Events" events={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("UpcomingEvents.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Upcoming Events PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Upcoming Events PDF",
              });
            }
          }}
        />
        <SummaryCardEvent
          title="Finished Events"
          value={finished}
          icon={<CalendarCheck size={50} />}
          onClick={async () => {
            const filtered = data.filter((d) => d.status === "Finished");
            const { pdf } = await import("@react-pdf/renderer");
            const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
            const { toast } = await import("sonner");
            const { EventPDF } = await import("@/components/pdf/eventpdf");

            const blob = await pdf(<EventPDF filter="Finished Events" events={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("FinishedEvents.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Finished Events PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Finished Events PDF",
              });
            }
          }}
        />
        <SummaryCardEvent
          title="Cancelled Events"
          value={cancelled}
          icon={<CalendarX2 size={50} />}
          onClick={async () => {
            const filtered = data.filter((d) => d.status === "Cancelled");
            const { pdf } = await import("@react-pdf/renderer");
            const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
            const { toast } = await import("sonner");
            const { EventPDF } = await import("@/components/pdf/eventpdf");

            const blob = await pdf(<EventPDF filter="Cancelled Events" events={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("CancelledEvents.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Cancelled Events PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Cancelled Events PDF",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={handleSearch}
          placeholder="Search Event"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Events"
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
        <AddEventModal onSave={fetchEvents} />
      </div>

      <DataTable<Event>
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
                  <ViewEventModal {...row.original} onSave={fetchEvents} />
                  {status !== "Upcoming" && status !== "Ongoing" && status !== "Finished" && (
                    <DeleteEventModal
                      {...row.original}
                      onDelete={fetchEvents}
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
