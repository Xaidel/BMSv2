import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddBlotterModal from "@/features/blotter/addBlotterModal";
import DeleteBlotterModal from "@/features/blotter/deleteBlotterModal";
import ViewBlotterModal from "@/features/blotter/viewBlotterModal";
import { pdf } from "@react-pdf/renderer"
import {
  DollarSign,
  Eye,
  Users,
  AlarmClock,
  Gavel,
  BookOpenCheck,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Blotter } from "@/types/types";
import sort from "@/service/blotter/blotterSort";
import searchBlotter from "@/service/blotter/searchBlotter";
import SummaryCardBlotter from "@/components/summary-card/blotter";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { BlotterPDF } from "@/components/pdf/blotterpdf";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs"

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
    header: "Blotter ID",
    accessorKey: "id",
  },
  {
    header: "Type",
    accessorKey: "type_",
  },
  {
    header: "Reported By",
    accessorKey: "reported_by",
  },
  {
    header: "Involved",
    accessorKey: "involved",
  },
  {
    header: "Date Incident",
    accessorKey: "incident_date",
    cell: ({ row }) => {
      return <div>{format(row.original.incident_date, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Zone",
    accessorKey: "zone",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color: string;
      switch (status) {
        case "On Going": {
          color = "#BD0000";
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


export default function Blotters() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<Blotter[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [printData, setPrintDataState] = useState<Blotter[] | null>(null);
  console.log(printData)
  const fetchBlotters = () => {
    invoke<Blotter[]>("fetch_all_blotters_command")
      .then((fetched) => {
        const parsed = fetched.map((blotter) => ({
          ...blotter,
          incident_date: new Date(blotter.incident_date),
          hearing_date: new Date(blotter.hearing_date),
        }));
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch blotters:", err));
  };

  useEffect(() => {
    fetchBlotters();
  }, []);

  // Pass the fetch function to AddBlotterModal
  <AddBlotterModal onSave={fetchBlotters} />;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = sort(data, searchParams.get("sort") ?? "All Blotters");

    if (searchQuery.trim()) {
      return searchBlotter(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, data, searchQuery]);

  const total = data.length;
  const finished = data.filter((d) => d.status === "Closed" || d.status === "Transferred to Police").length;
  const active = data.filter((d) => d.status === "Active").length;
  const ongoing = data.filter((d) => d.status === "On Going").length;
  const closed = data.filter((d) => d.status === "Closed").length;
  const transferred = data.filter(
    (d) => d.status === "Transferred to Police"
  ).length;

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      toast.error("No blotters selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_blotter_command", { id });
        }
      }
      toast.success("Selected blotters deleted.");
      fetchBlotters(); // Refresh the table
      setRowSelection({}); // Reset selection
    } catch (err) {
      toast.error("Failed to delete selected blotters");
      console.error("Delete error:", err);
    }
  };

  function setPrintData(data: Blotter[]) {
    setPrintDataState(data);
  }

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardBlotter
          title="Total Blotters"
          value={total}
          icon={<Users size={50}
          />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="All Blotters" blotters={data} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
            }
          }}
        />

        <SummaryCardBlotter
          title="Total Finished"
          value={finished}
          icon={<BookOpenCheck size={50} />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="Finished Blotters" blotters={data.filter((d) => d.status === "Finished")} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
            }
          }}
        />
        <SummaryCardBlotter
          title="Active"
          value={active}
          icon={<Eye size={50} />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="Active Blotters" blotters={data.filter((d) => d.status === "Active")} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
            }

          }}
        />
        <SummaryCardBlotter
          title="On Going"
          value={ongoing}
          icon={<AlarmClock size={50} />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="On Going Blotters" blotters={data.filter((d) => d.status === "On Going")} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
            }
          }}
        />
        <SummaryCardBlotter
          title="Closed"
          value={closed}
          icon={<Gavel size={50} />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="Closed Blotters" blotters={data.filter((d) => d.status === "Closed")} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
            }
          }}
        />
        <SummaryCardBlotter
          title="Transferred to Police"
          value={transferred}
          icon={<DollarSign size={50} />}
          onClick={async () => {
            setPrintData(data)
            const blob = await pdf(<BlotterPDF filter="Blotters that are transferred to police" blotters={data.filter((d) => d.status === "Transferred to Police")} />).toBlob()
            const buffer = await blob.arrayBuffer()
            const contents = new Uint8Array(buffer)
            try {
              await writeFile('BlotterRecords.pdf', contents, {
                baseDir: BaseDirectory.Document
              })
              toast.success("Blotter Record successfully downloaded", {
                description: "Blotter record is saved in Documents folder"
              })
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Blotter record"
              })
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
          disabled={Object.keys(rowSelection).length === 0}
          onClick={handleDeleteSelected}
        >
          <Trash />
          Delete Selected
        </Button>

        <AddBlotterModal onSave={fetchBlotters} />
      </div>

      <DataTable<Blotter>
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
                  <ViewBlotterModal {...row.original} onSave={fetchBlotters} />
                  {status !== "Active" && (
                    <DeleteBlotterModal
                      {...row.original}
                      onDelete={fetchBlotters}
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

/**
 *
 * **/
