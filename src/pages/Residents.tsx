// Residents page implemented by mirroring Household logic
// (Code inserted here reflects working data table, filter, summary, and modal handling for Resident records)

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddResidentModal from "@/features/residents/addResidentModal";
import DeleteResidentModal from "@/features/residents/deleteResidentModal";
import ViewResidentModal from "@/features/residents/viewResidentModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, Users, UserCheck, UserMinus, Mars, Venus, User, Accessibility, Fingerprint } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Resident } from "@/types/types";
import { sort } from "@/service/resident/residentSort";
import searchResident from "@/service/resident/searchResident";
import SummaryCardResidents from "@/components/summary-card/residents";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

const filters = ["All Residents", "Alphabetical", "Moved Out", "Active", "Dead", "Missing"];

const columns: ColumnDef<Resident>[] = [
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
    header: "Full Name",
    cell: ({ row }) => {
      const r = row.original;
      const fullName = [r.last_name ? r.last_name + "," : "", r.first_name, r.middle_name, r.suffix].filter(Boolean).join(" ");
      return <div>{fullName}</div>;
    },
  },
  {
    header: "Civil Status",
    accessorKey: "civil_status",
  },
  {
    header: "Birthday",
    accessorKey: "date_of_birth",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.date_of_birth), "MMMM do, yyyy")}</div>
    ),
  },
  {
    header: "Gender",
    accessorKey: "gender",
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
      let color = {
        "Moved Out": "#BD0000",
        "Active": "#00BD29",
        "Dead": "#000000",
        "Missing": "#FFB30F"
      }[status] || "#000000";
      return <div style={{ color }}>{status}</div>;
    },
  },
];

export default function Residents() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Resident[]>([]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };


  const filteredData = useMemo(() => {
    const sortValue = searchParams.get("sort") ?? "All Residents";
    let sorted = sort(data, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = searchResident(query, sorted);
    }

    return sorted;
  }, [searchParams, searchQuery, data]);

  const fetchResidents = () => {
    invoke<Resident[]>("fetch_all_residents_command")
      .then((fetched) => {
        setData(fetched);
      })
      .catch((err) => console.error("Failed to fetch residents:", err));
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      toast.error("No residents selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_resident_command", { id });
        }
      }
      toast.success("Selected residents deleted.");
      fetchResidents(); // Refresh the table
      setRowSelection({}); // Reset selection
    } catch (err) {
      toast.error("Failed to delete selected residents");
      console.error("Delete error:", err);
    }
  };

  const total = data.length;
  const active = data.filter((r) => r.status === "Active").length;
  const movedOut = data.filter((r) => r.status === "Moved Out").length;
  const male = data.filter((r) => r.gender === "Male").length;
  const female = data.filter((r) => r.gender === "Female").length;
  const senior = data.filter((r) => r.is_senior).length;
  const pwd = data.filter((r) => r.is_pwd).length;
  const registered = data.filter((r) => r.is_registered_voter).length;

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardResidents
          title="Total Residents"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const { pdf } = await import("@react-pdf/renderer");
            const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
            const { toast } = await import("sonner");
            const { ResidentPDF } = await import("@/components/pdf/residentpdf");

            const casted: Resident[] = data.map((r) => ({
              ...r,
              date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
            })) as Resident[];

            const blob = await pdf(<ResidentPDF filter="All Residents" residents={casted} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ResidentRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Resident Record successfully downloaded", {
                description: "Resident record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Resident record",
              });
            }
          }}
        />
        <SummaryCardResidents title="Male" value={male} icon={<Mars size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.gender === "Male");
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Male Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("MaleResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Male Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Male Resident PDF",
            });
          }
        }} />
        <SummaryCardResidents title="Female" value={female} icon={<Venus size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.gender === "Female");
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Female Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("FemaleResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Female Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Female Resident PDF",
            });
          }
        }} />
        <SummaryCardResidents title="Senior" value={senior} icon={<User size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.is_senior === true);
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Senior Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("SeniorResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Senior Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Senior Resident PDF",
            });
          }
        }} />
        <SummaryCardResidents title="PWD" value={pwd} icon={<Accessibility size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.is_pwd === true);
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="PWD Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("PWDResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("PWD Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save PWD Resident PDF",
            });
          }
        }} />
        <SummaryCardResidents title="Registered Voters" value={registered} icon={<Fingerprint size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.is_registered_voter === true);
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Registered Voters" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("RegisteredVoters.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Registered Voters PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Registered Voters PDF",
            });
          }
        }} />
        <SummaryCardResidents title="Active" value={active} icon={<UserCheck size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.status === "Active");
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Active Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("ActiveResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Active Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Active Resident PDF",
            });
          }
        }} />
        <SummaryCardResidents title="Moved Out" value={movedOut} icon={<UserMinus size={50} />} onClick={async () => {
          const { pdf } = await import("@react-pdf/renderer");
          const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const { toast } = await import("sonner");
          const { ResidentPDF } = await import("@/components/pdf/residentpdf");

          const filtered = data.filter((r) => r.status === "Moved Out");
          const casted: Resident[] = filtered.map((r) => ({
            ...r,
            date_of_birth: typeof r.date_of_birth === "string" ? new Date(r.date_of_birth) : r.date_of_birth,
          }));

          const blob = await pdf(<ResidentPDF filter="Moved Out Residents" residents={casted} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const contents = new Uint8Array(buffer);
          try {
            await writeFile("MovedOutResidents.pdf", contents, {
              baseDir: BaseDirectory.Document,
            });
            toast.success("Moved Out Resident PDF downloaded", {
              description: "Saved in Documents folder",
            });
          } catch (e) {
            toast.error("Error", {
              description: "Failed to save Moved Out Resident PDF",
            });
          }
        }} />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar onChange={(value) => setSearchQuery(value)} placeholder="Search Resident" classname="flex flex-5" />
        <Filter onChange={handleSortChange} filters={filters} initial="All Residents" classname="flex-1" />
        <Button variant="destructive" size="lg" disabled={Object.keys(rowSelection).length === 0} onClick={handleDeleteSelected}>
          <Trash /> Delete Selected
        </Button>
        <AddResidentModal onSave={fetchResidents} />
      </div>

      <DataTable<Resident>
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
                <ViewResidentModal {...row.original} onSave={fetchResidents} />
                <DeleteResidentModal
                  id={row.original.id}
                  full_name={row.original.full_name}
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
