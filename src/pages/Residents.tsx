import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddResidentModal from "@/features/residents/addResidentModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Trash,
  Users,
  UserCheck,
  UserMinus,
  Mars,
  Venus,
  User,
  Eye,
  Accessibility,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { sort } from "@/service/resident/residentSort";
import searchResident from "@/service/resident/searchResident";
import SummaryCardResidents from "@/components/summary-card/residents";
import { useResident } from "@/features/api/resident/useResident";

import { useDeleteResident } from "@/features/api/resident/useDeleteResident";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ViewResidentModal from "@/features/residents/viewResidentModal";
import { Resident } from "@/types/apitypes";
import { ResidentPDF } from "@/components/pdf/residentpdf";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";

const filters = [
  "All Residents",
  "Alphabetical",
  "Moved Out",
  "Active",
  "Dead",
  "Missing",
];

const columns: ColumnDef<Resident>[] = [
  {
    header: "Full Name",
    cell: ({ row }) => {
      const r = row.original;
      const middleName = r.Middlename ? r.Middlename : "";
      const fullName = `${r.Lastname}, ${r.Firstname} ${middleName}`;
      return <div>{fullName}</div>;
    },
  },
  {
    header: "Civil Status",
    accessorKey: "CivilStatus",
  },
  {
    header: "Birthday",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.Birthday), "MMMM do, yyyy")}</div>
    ),
  },
  {
    header: "Gender",
    accessorKey: "Gender",
  },
  {
    header: "Zone",
    accessorKey: "Zone",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.Status;
      let color =
        {
          "Moved Out": "#BD0000",
          Active: "#00BD29",
          Dead: "#000000",
          Missing: "#FFB30F",
        }[status] || "#000000";
      return <div style={{ color }}>{status}</div>;
    },
  },
];

export default function Residents() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
  const deleteMutation = useDeleteResident();
  const { data: residents } = useResident();
  const queryClient = useQueryClient();
  const [viewResidentId, setViewResidentId] = useState<number | null>(null);
  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const filteredData = useMemo(() => {
    if (!residents) return [];
    const sortValue = searchParams.get("sort") ?? "All Residents";
    let sorted = sort(residents.residents, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = searchResident(query, sorted);
    }

    return sorted;
  }, [searchParams, searchQuery, residents]);

  const res = residents?.residents || [];
  const total = res.length;
  const active = res.filter((r) => r.Status === "Active").length;
  const movedOut = res.filter((r) => r.Status === "Moved Out").length;
  const male = res.filter((r) => r.Gender === "Male").length;
  const female = res.filter((r) => r.Gender === "Female").length;
  const senior = res.filter((r) => r.IsSenior).length;
  const SoloParent = res.filter((r) => r.IsSolo).length;
  const IsPWD = res.filter((r) => r.IsPWD).length;

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardResidents
          title="Total Residents"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const casted: Resident[] = res.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            })) as Resident[];

            const blob = await pdf(
              <ResidentPDF filter="All Residents" residents={casted} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              writeFile("ResidentRecords.pdf", contents, {
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
        <SummaryCardResidents
          title="Male"
          value={male}
          icon={<Mars size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.Gender === "Male");
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Male Residents" residents={casted} />
            ).toBlob();
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
          }}
        />
        <SummaryCardResidents
          title="Female"
          value={female}
          icon={<Venus size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.Gender === "Female");
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Female Residents" residents={casted} />
            ).toBlob();
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
          }}
        />
        <SummaryCardResidents
          title="Senior"
          value={senior}
          icon={<User size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.IsSenior);
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Senior Residents" residents={casted} />
            ).toBlob();
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
          }}
        />
        <SummaryCardResidents
          title="PWD"
          value={IsPWD}
          icon={<Accessibility size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.IsVoter === true);
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="PWD" residents={casted} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("PWDs.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("PWDs PDF downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save PWD PDF",
              });
            }
          }}
        />
        <SummaryCardResidents
          title="Solo Parent"
          value={SoloParent}
          icon={<User size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.IsVoter === true);
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Solo Parents" residents={casted} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("SoloParents.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Solo Parents PDF downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Solo Parents PDF",
              });
            }
          }}
        />
        <SummaryCardResidents
          title="Active"
          value={active}
          icon={<UserCheck size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.Status === "Active");
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Active Residents" residents={casted} />
            ).toBlob();
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
          }}
        />
        <SummaryCardResidents
          title="Moved Out"
          value={movedOut}
          icon={<UserMinus size={50} />}
          onClick={async () => {
            const filtered = res.filter((r) => r.Status === "Moved Out");
            const casted: Resident[] = filtered.map((r) => ({
              ...r,
              Birthday:
                typeof r.Birthday === "string"
                  ? new Date(r.Birthday)
                  : r.Birthday,
            }));

            const blob = await pdf(
              <ResidentPDF filter="Moved Out Residents" residents={casted} />
            ).toBlob();
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
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search Resident"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Residents"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => {
            if (selectedResidents) {
              toast.promise(deleteMutation.mutateAsync(selectedResidents), {
                loading: "Deleting residents, Please wait...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["residents"] });
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedResidents.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    return newSelection;
                  });
                  setSelectedResidents([]);
                  return {
                    message: "Resident successfully deleted",
                  };
                },
                error: (error: { error: string }) => {
                  return {
                    message: "Failed to delete residents",
                    description: error.error,
                  };
                },
              });
            }
          }}
        >
          <Trash /> Delete Selected
        </Button>
        <AddResidentModal />
      </div>

      <DataTable<Resident>
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
                    const allVisibileRows = table
                      .getRowModel()
                      .rows.map((row) => row.original.ID);
                    setSelectedResidents(allVisibileRows);
                  } else {
                    setSelectedResidents([]);
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
                    setSelectedResidents((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedResidents((prev) =>
                      prev.filter((res) => res !== row.original.ID)
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
                <Button onClick={() => setViewResidentId(row.original.ID)}>
                  <Eye /> View Resident
                </Button>
                {/* <DeleteResidentModal
                  id={row.original.id}
                  full_name={row.original.full_name}
                /> */}
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewResidentId !== null && (
        <ViewResidentModal
          resident={residents.residents.find((e) => e.ID === viewResidentId)}
          open={true}
          onClose={() => setViewResidentId(null)}
        />
      )}
    </>
  );
}
