import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import SummaryCardEvent from "@/components/summary-card/event";
import AddEventModal from "@/features/event/addEventModal";
import ViewEventModal from "@/features/event/viewEventModal";
import { sort } from "@/service/event/eventSort";
import searchEvent from "@/service/event/searchEvent";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {Trash, CalendarPlus, CalendarCheck, CalendarX2, CalendarClock, Eye,} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEvent } from "@/features/api/event/useEvent";
import { Event } from "@/types/apitypes";
import { toast } from "sonner";
import { useDeleteEvent } from "@/features/api/event/useDeleteEvent";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { EventPDF } from "@/components/pdf/eventpdf";

const filters = [
  "All Events",
  "Date ASC",
  "Date DESC",
  "Upcoming",
  "Ongoing",
  "Finished",
  "Cancelled",
];

const columns: ColumnDef<Event>[] = [
  {
    header: "Name",
    accessorKey: "Name",
  },
  {
    header: "Type",
    accessorKey: "Type",
  },
  {
    header: "Date",
    accessorKey: "Date",
    cell: ({ row }) => {
      return <div>{format(row.original.Date, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Venue",
    accessorKey: "Venue",
  },
  {
    header: "Status",
    accessorKey: "Status",
    cell: ({ row }) => {
      const status = row.original.Status;
      let color: string;
      switch (status) {
        case "Upcoming": {
          color = "#BD0000";
          break;
        }
        case "Ongoing": {
          color = "#FFB30F";
          break;
        }
        case "Cancelled": {
          color = "#000000";
          break;
        }
        case "Finished": {
          color = "#00BD29";
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
  const user = sessionStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [selectedEvent, setSelectedEvent] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: eventResponse } = useEvent();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteEvent();

  const event = useMemo(() => {
    return eventResponse?.events ?? [];
  }, [eventResponse]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = sort(event, searchParams.get("sort") ?? "All Events");

    if (searchQuery.trim()) {
      return searchEvent(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, event, searchQuery]);
  const total = event.length;
  const finished = event.filter((d) => d.Status === "Finished").length;
  const upcoming = event.filter((d) => d.Status === "Upcoming").length;
  const cancelled = event.filter((d) => d.Status === "Cancelled").length;
  const [viewEventId, setViewEventId] = useState<number | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardEvent
          title="Total Events"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <EventPDF filter="All Events" events={[]} />
            ).toBlob();
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
            const blob = await pdf(
              <EventPDF filter="Upcoming Events" events={[]} />
            ).toBlob();
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
            const blob = await pdf(
              <EventPDF filter="Finished Events" events={[]} />
            ).toBlob();
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
            const blob = await pdf(
              <EventPDF filter="Cancelled Events" events={[]} />
            ).toBlob();
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
          disabled={
            Object.keys(rowSelection).length === 0 ||
            parsedUser.user.Role !== "secretary"
          }
          onClick={() => {
            console.log(parsedUser.user.Role);
            if (selectedEvent) {
              toast.promise(deleteMutation.mutateAsync(selectedEvent), {
                loading: "Deleting events. Please wait",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["events"] });
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedEvent.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    console.log(newSelection);
                    return newSelection;
                  });
                  setSelectedEvent([]);
                  return {
                    message: "Event successfully deleted",
                  };
                },
                error: (error: ErrorResponse) => {
                  return {
                    message: "Failed to delete event",
                    description: error.error,
                  };
                },
              });
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddEventModal />
      </div>

      <DataTable<Event>
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
                    setSelectedEvent(allVisibleRows);
                  } else {
                    setSelectedEvent([]);
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
                    setSelectedEvent((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedEvent((prev) =>
                      prev.filter((event) => event !== row.original.ID)
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
            cell: ({ row }) => {
              //             const status = row.original.Status;
              return (
                <div className="flex gap-3">
                  <Button onClick={() => setViewEventId(row.original.ID)}>
                    <Eye /> View Event
                  </Button>
                </div>
              );
            },
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewEventId !== null && (
        <ViewEventModal
          event={event.find((e) => e.ID === viewEventId)}
          open={true}
          onClose={() => setViewEventId(null)}
        />
      )}
    </>
  );
}
