import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddHouseholdModal from "@/features/households/addHouseholdModal";
import DeleteHouseholdModal from "@/features/households/deleteHouseholdModal";
import ViewHouseholdModal from "@/features/households/viewHouseholdModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, Home, HomeIcon, UserCheck, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Household } from "@/types/types";
import { sort } from "@/service/household/householdSort";
import SummaryCard from "@/components/summary-card/household";
import { invoke } from "@tauri-apps/api/core";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { HouseholdPDF } from "@/components/pdf/householdpdf";
import { toast } from "sonner";

const filters = ["All Households", "Numerical", "Renter", "Owner"];

const columns: ColumnDef<Household>[] = [
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
    header: "House Number",
    accessorKey: "household_number",
  },
  {
    header: "Type of Household",
    accessorKey: "type_",
  },
  {
    header: "Family Members",
    accessorKey: "members",
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
        default: {
          color = "#000000";
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
  const [data, setData] = useState<Household[]>([]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };


  const filteredData = useMemo(() => {
    const sortValue = searchParams.get("sort") ?? "All Households";
    let sorted = sort(data, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = sorted.filter(
        (item) =>
          item.type_?.toLowerCase().includes(query) ||
          item.head?.toLowerCase().includes(query)
      );
    }

    return sorted;
  }, [searchParams, searchQuery, data]);

  const fetchHouseholds = () => {
    invoke<Household[]>("fetch_all_households_command")
      .then((fetched) => {
        const parsed = fetched.map((household) => ({
          ...household,
          date: new Date(household.date),
        }));
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch households:", err));
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      console.error("No household records selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_household_command", { id });
        }
      }
      console.log("Selected households deleted.");
      fetchHouseholds();
      setRowSelection({});
    } catch (err) {
      console.error("Failed to delete selected households", err);
    }
  };

  <AddHouseholdModal onSave={fetchHouseholds} />;


  const totalActive = data.filter((item) => item.status === "Active").length;
  const totalRenter = data.filter((item) => item.type_ === "Renter").length;
  const totalOwner = data.filter((item) => item.type_ === "Owner").length;
  const total = data.length;

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCard
          title="Total Households"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const blob = await pdf(<HouseholdPDF filter="All Households" households={data} />).toBlob();
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
            const filtered = data.filter((d) => d.status === "Active");
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
            const filtered = data.filter((d) => d.type_ === "Renter");
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
            const filtered = data.filter((d) => d.type_ === "Owner");
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
          onClick={handleDeleteSelected}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddHouseholdModal onSave={fetchHouseholds} />
      </div>
      <DataTable<Household>
        classname="py-5"
        height="43.3rem"
        data={filteredData}
        columns={[
          ...columns,
          {
            id: "view",
            header: "",
            cell: ({ row }) => (
              <div className="flex gap-3">
                <ViewHouseholdModal {...row.original} onSave={fetchHouseholds} />
                <DeleteHouseholdModal
                  id={row.original.id!}
                  type_={row.original.type_}
                  household_number={row.original.household_number}
                  onDelete={fetchHouseholds}
                />
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </>
  );
}
