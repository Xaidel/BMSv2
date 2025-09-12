import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddHouseholdModal from "@/features/households/addHouseholdModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, Home, HomeIcon, UserCheck, Users, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Household } from "@/types/apitypes";
import { sort } from "@/service/household/householdSort";
import SummaryCard from "@/components/summary-card/household";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { HouseholdPDF } from "@/components/pdf/householdpdf";
import { toast } from "sonner";
import { useHousehold } from "@/features/api/household/useHousehold";
import ViewHouseholdModal from "@/features/households/viewHouseholdModal";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteHousehold } from "@/features/api/household/useDeleteHousehold";

const filters = ["All Households", "Numerical", "Renter", "Owner"];

const columns: ColumnDef<Household>[] = [
  {
    header: "House Number",
    accessorKey: "household_number",
  },
  {
    header: "Type of Household",
    accessorKey: "type",
  },
  {
    header: "Head of Household",
    accessorKey: "head",
  },
  {
    header: "Zone",
    accessorKey: "zone",
  },
  {
    header: "Date of Residency",
    accessorKey: "date",
    cell: ({ row }) => {
      return <div>{format(row.original.date, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color: string;
      switch (status) {
        case "Moved Out": {
          color = "#BD0000";
          break;
        }
        case "Active": {
          color = "#00BD29";
          break;
        }
        case "Others": {
          color = "#0000FF";
          break;
        }
        default: {
          color = "#0000FF";
        }
      }
      return <div style={{ color: color }}>{status}</div>;
    },
  },
];


export default function Households() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHousehold, setSelectedHousehold] = useState<number[]>([]);
  const { data: household, isFetching } = useHousehold()
  const [viewHouseholdId, setViewHouseholdId] = useState<number | null>(null)
  const deleteMutation = useDeleteHousehold()
  const queryClient = useQueryClient()
  const parsedData = useMemo(() => {
    if (isFetching || !household || !household.households) return []
    return household.households.map((household) => {
      const member = household.residents.map(r => ({
        ID: r.id,
        Firstname: r.firstname,
        Lastname: r.lastname,
        Role: r.role,
        Income: r.income,
      }));
      const head = household.residents.find(r => r.role.toLowerCase() === "head");
      return {
        id: household.id,
        household_number: household.household_number,
        type: household.type,
        member,
        head: head ? `${head.firstname} ${head.lastname}` : "N/A",
        zone: household.zone,
        date: new Date(household.date_of_residency),
        status: household.status,
      };
    });
  }, [household, isFetching]);
  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const filteredData = useMemo(() => {
    const sortValue = searchParams.get("sort") ?? "All Households";
    let sorted = sort(parsedData, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = sorted.filter(
        (item) =>
          item.household_number.includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.head?.toLowerCase().includes(query)
      );
    }
    return sorted;
  }, [searchParams, searchQuery, parsedData]);
  
  const totalActive = parsedData.filter((item) => item.status === "Active").length;
  const totalRenter = parsedData.filter((item) => item.type === "Renter").length;
  const totalOwner = parsedData.filter((item) => item.type === "Owner").length;
  const total = parsedData.length;
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCard
          title="Total Households"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const blob = await pdf(<HouseholdPDF filter="All Households" households={parsedData} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("AllHouseholds.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("All Households PDF downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the file",
              });
            }
          }}
        />
        <SummaryCard
          title="Active Households"
          value={totalActive}
          icon={<UserCheck size={50} />}
          onClick={async () => {
            const filtered = parsedData.filter((d) => d.status === "Active");
            const blob = await pdf(<HouseholdPDF filter="Active Households" households={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ActiveHouseholds.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Active Households PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Active Households PDF",
              });
            }
          }}
        />
        <SummaryCard
          title="Renter"
          value={totalRenter}
          icon={<HomeIcon size={50} />}
          onClick={async () => {
            const filtered = parsedData.filter((d) => d.type === "Renter");
            const blob = await pdf(<HouseholdPDF filter="Renter Households" households={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("RenterHouseholds.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Renter Households PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Renter Households PDF",
              });
            }
          }}
        />
        <SummaryCard
          title="Owner"
          value={totalOwner}
          icon={<Home size={50} />}
          onClick={async () => {
            const filtered = parsedData.filter((d) => d.type === "Owner");
            const blob = await pdf(<HouseholdPDF filter="Owner Households" households={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("OwnerHouseholds.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Owner Households PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Owner Households PDF",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search Household"
          classname="flex flex-5"
        />

        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Households"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => {
            if (selectedHousehold) {
              toast.promise(
                deleteMutation.mutateAsync(selectedHousehold), {
                loading: "Deleting household, Please wait...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ['household'] })
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedHousehold.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    return newSelection;
                  });   
                  setSelectedHousehold([])
                  return {
                    message: "Household successfully deleted"
                  }
                },
                error: (error: any) => {
                  return {
                    message: "Failed to delete households",
                    description: error?.response?.data?.message || error.message
                  }
                }
              }
              )
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddHouseholdModal />
      </div>
      <DataTable<Household>
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
                  table.toggleAllPageRowsSelected(!!value)
                  if(value){
                    const allVisibleRows = table.getRowModel().rows.map(row => row.original.id);
                    setSelectedHousehold(allVisibleRows);
                  } else {
                    setSelectedHousehold([]);
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
                  row.toggleSelected(!!value)
                  if(value){
                    setSelectedHousehold((prev) => [...prev, row.original.id]);
                  }else {
                    setSelectedHousehold((prev) =>
                    prev.filter((id) => id !== row.original.id)
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
                <Button onClick={() => setViewHouseholdId(row.original.id)}>
                  <Eye />View Household
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewHouseholdId !== null && (
        <ViewHouseholdModal
          household={parsedData.find((e => e.id === viewHouseholdId))}
          open={true}
          onClose={() => setViewHouseholdId(null)}
        />
      )}
    </>
  );
}
