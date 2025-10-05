import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddGovDocsModal from "@/features/gov_docs/addGovDocsModal";
import ViewGovDocsModal from "@/features/gov_docs/viewGovDocsModal";
import { sort } from "@/service/gov_docs/govDocsSort";
import searchGovDocs from "@/service/gov_docs/searchGovDocs";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, CalendarPlus, CalendarCheck, CalendarX2, CalendarClock, Eye, } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GovDoc } from "@/types/apitypes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useGovDocs } from "@/features/api/gov_docs/useGovDocs";
import { useDeleteGovDocs } from "@/features/api/gov_docs/useDeleteGovDocs";
import { GovDocsPDF } from "@/components/pdf/gov_docs";
import SummaryCardGovDocs from "@/components/summary-card/gov_docs";


const filters = [
  "All Records",
  "Date Issued ASC",
  "Date Issued DESC",
  "Executive Orders",
  "Resolutions",
  "Ordinances",
];

const columns: ColumnDef<GovDoc>[] = [
  {
    header: "Title",
    accessorKey: "Title",
  },
  {
    header: "Type",
    accessorKey: "Type",
  },
  {
    header: "Date Issued",
    accessorKey: "DateIssued",
    cell: ({ row }) => {
      return <div>{format(row.original.DateIssued, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Description",
    accessorKey: "Description",
  },
];

export default function GovDocs() {
  const user = sessionStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [selectedGovDocs, setSelectedGovDocs] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: govDocsResponse } = useGovDocs();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteGovDocs();
  const govDocs = useMemo(() => {
    return govDocsResponse?.records ?? [];
  }, [govDocsResponse]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = sort(govDocs, searchParams.get("sort") ?? "All Records");

    if (searchQuery.trim()) {
      return searchGovDocs(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, govDocs, searchQuery]);
  const total = govDocs.length;
  const executiveOrders = govDocs.filter((d) => d.Type === "Executive Order").length;
  const resolutions = govDocs.filter((d) => d.Type === "Resolution").length;
  const ordinances = govDocs.filter((d) => d.Type === "Ordinance").length;
  const [viewGovDocsId, setViewGovDocsId] = useState<number | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardGovDocs
          title="Total Records"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <GovDocsPDF filter="All Records" govDocs={govDocs} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("GovDocsRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Government Document successfully downloaded", {
                description: "Record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Government Document record",
              });
            }
          }}
        />
        <SummaryCardGovDocs
          title="Executive Orders"
          value={executiveOrders}
          icon={<CalendarPlus size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <GovDocsPDF filter="Executive Order" govDocs={govDocs.filter((e) => e.Type === "Executive Order")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ExecutiveOrders.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Executive Orders PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Executive Orders PDF",
              });
            }
          }}
        />
        <SummaryCardGovDocs
          title="Resolutions"
          value={resolutions}
          icon={<CalendarCheck size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <GovDocsPDF filter="Resolution" govDocs={govDocs.filter((e) => e.Type === "Resolution")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("Resolutions.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Resolutions PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Resolutions PDF",
              });
            }
          }}
        />
        <SummaryCardGovDocs
          title="Ordinances"
          value={ordinances}
          icon={<CalendarX2 size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <GovDocsPDF filter="Ordinance" govDocs={govDocs.filter((e) => e.Type === "Ordinance")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("Ordinances.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Ordinances PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Ordinances PDF",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={handleSearch}
          placeholder="Search Government Document"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Records"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          onClick={() => {
            console.log(parsedUser.user.Role);
            if (selectedGovDocs) {
              toast.promise(deleteMutation.mutateAsync(selectedGovDocs), {
                loading: "Deleting government documents. Please wait",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["govDocs"] });
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedGovDocs.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    console.log(newSelection);
                    return newSelection;
                  });
                  setSelectedGovDocs([]);
                  return {
                    message: "Government Document successfully deleted",
                  };
                },
                error: (error: ErrorResponse) => {
                  return {
                    message: "Failed to delete government document",
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
        <AddGovDocsModal />
      </div>

      <DataTable<GovDoc>
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
                    setSelectedGovDocs(allVisibleRows);
                  } else {
                    setSelectedGovDocs([]);
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
                    setSelectedGovDocs((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedGovDocs((prev) =>
                      prev.filter((govDoc) => govDoc !== row.original.ID)
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
              return (
                <div className="flex gap-3">
                  <Button onClick={() => setViewGovDocsId(row.original.ID)}>
                    <Eye /> View Government Document
                  </Button>
                </div>
              );
            },
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewGovDocsId !== null && (
        <ViewGovDocsModal
          govDoc={govDocs.find((e) => e.ID === viewGovDocsId)}
          open={true}
          onClose={() => setViewGovDocsId(null)}
        />
      )}
    </>
  );
}
