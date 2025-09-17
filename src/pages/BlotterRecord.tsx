import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddBlotterModal from "@/features/blotter/addBlotterModal";
import ViewBlotterModal from "@/features/blotter/viewBlotterModal";
import { Eye, Users, Gavel, BookOpenCheck, Siren, Loader } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Blotter } from "@/types/apitypes";
import sort from "@/service/blotter/blotterSort";
import searchBlotter from "@/service/blotter/searchBlotter";
import { useDeleteBlotter } from "@/features/api/blotter/useDeleteBlotter";
import { useBlotter } from "@/features/api/blotter/useBlotter";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import SummaryCardBlotter from "@/components/summary-card/blotter";
import { BlotterPDF } from "@/components/pdf/blotterpdf";

const filters = [
  "All Blotter Records",
  "Alphabetical",
  "ID",
  "Active",
  "On Going",
  "Closed",
  "Transferred to Police",
  "Date Incident",
];

const columns: ColumnDef<Blotter>[] = [
  {
    header: "Case Number",
    accessorKey: "ID",
  },
  {
    header: "Type",
    accessorKey: "Type",
  },
  {
    header: "Reported By",
    accessorKey: "ReportedBy",
  },
  {
    header: "Involved",
    accessorKey: "Involved",
  },
  {
    header: "Date Incident",
    accessorKey: "IncidentDate",
    cell: ({ row }) => {
      return <div>{format(row.original.IncidentDate, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Zone",
    accessorKey: "Zone",
  },
  {
    header: "Status",
    accessorKey: "Status",
    cell: ({ row }) => {
      const Status = row.original.Status;
      let color: string;
      switch (Status) {
        case "On Going": {
          color = "#FFB30F";

          break;
        }
        case "Active": {
          color = "#00BD29";
          break;
        }
        case "Closed": {
          color = "#000000";
          break;
        }
        case "Transferred to Police": {
          color = "#BD0000";
          break;
        }
        default: {
          color = "#000000";
        }
      }
      return <div style={{ color: color }}>{Status}</div>;
    },
  },
];

export default function BlotterRecordPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlotter, setSelectedBlotter] = useState<number[]>([]);
  const { data: blotterResponse } = useBlotter();
  const { mutateAsync: deleteBlotter } = useDeleteBlotter();
  const blotter = useMemo(() => {
    return blotterResponse?.blotters ?? [];
  }, [blotterResponse]);

  const total = blotter.length;
  const finished = blotter.filter((d) => d.Status === "Closed").length;
  const active = blotter.filter((d) => d.Status === "Active").length;
  const ongoing = blotter.filter((d) => d.Status === "On Going").length;
  const closed = blotter.filter((d) => d.Status === "Closed").length;
  const transferred = blotter.filter(
    (d) => d.Status === "Transferred to Police"
  ).length;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(
      blotter,
      searchParams.get("sort") ?? "All Blotter Records"
    );
    if (searchQuery.trim()) {
      return searchBlotter(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, blotter, searchQuery]);
  const [viewBlotterId, setViewBlotterId] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardBlotter
          title="Total Blotters"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <BlotterPDF filter="All Blotters" blotters={blotter} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("BlotterRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
        <SummaryCardBlotter
          title="Total Finished"
          value={finished}
          icon={<BookOpenCheck size={50} />}
          onClick={async () => {
            const filtered = blotter.filter((d) => d.Status === "Finished");
            const blob = await pdf(
              <BlotterPDF filter="Finished Blotters" blotters={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("FinishedBlotters.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
        <SummaryCardBlotter
          title="Active"
          value={active}
          icon={<Eye size={50} />}
          onClick={async () => {
            const filtered = blotter.filter((d) => d.Status === "Active");
            const blob = await pdf(
              <BlotterPDF filter="Active Blotters" blotters={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ActiveBlotters.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
        <SummaryCardBlotter
          title="On Going"
          value={ongoing}
          icon={<Loader size={50} />}
          onClick={async () => {
            const filtered = blotter.filter((d) => d.Status === "On Going");
            const blob = await pdf(
              <BlotterPDF filter="On Going Blotters" blotters={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("OngoingBlotters.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
        <SummaryCardBlotter
          title="Closed"
          value={closed}
          icon={<Gavel size={50} />}
          onClick={async () => {
            const filtered = blotter.filter((d) => d.Status === "Closed");
            const blob = await pdf(
              <BlotterPDF filter="Closed Blotters" blotters={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ClosedBlotters.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
        <SummaryCardBlotter
          title="Transferred to Police"
          value={transferred}
          icon={<Siren size={50} />}
          onClick={async () => {
            const filtered = blotter.filter(
              (d) => d.Status === "Transferred to Police"
            );
            const blob = await pdf(
              <BlotterPDF
                filter="Blotters that are transferred to police"
                blotters={filtered}
              />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("TransferredBlotters.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={handleSearch}
          placeholder="Search Blotter"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Blotter"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={selectedBlotter.length === 0}
          onClick={() => {
            if (selectedBlotter.length > 0) {
              toast.promise(deleteBlotter(selectedBlotter), {
                loading: "Deleting selected blotter. Please wait",
                success: () => {
                  setSelectedBlotter([]);
                  setRowSelection({});
                  return {
                    message: "Selected blotter deleted successfully",
                  };
                },
                error: () => {
                  return {
                    message: "Failed to delete selected blotters",
                  };
                },
              });
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddBlotterModal />
      </div>

      {/* Data Table */}
      <DataTable<Blotter>
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
                    setSelectedBlotter(allVisibleRows);
                  } else {
                    setSelectedBlotter([]);
                  }
                }}
                aria-label="Select all"
                className="flex items-center justify-center"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={selectedBlotter.includes(row.original.ID)}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedBlotter((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedBlotter((prev) =>
                      prev.filter((id) => id !== row.original.ID)
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
              <div className="flex gap-3">
                <Button onClick={() => setViewBlotterId(row.original.ID)}>
                  <Eye /> View More
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={(selected) => {
          setRowSelection(selected);
          const selectedIds = Object.keys(selected)
            .filter((key) => selected[key])
            .map((key) => Number(key));
          setSelectedBlotter(selectedIds);
        }}
      />
      {viewBlotterId !== null && (
        <ViewBlotterModal
          blotter={blotter.find((b) => b.ID === viewBlotterId)}
          open={true}
          onClose={() => setViewBlotterId(null)}
        />
      )}
    </>
  );
}
