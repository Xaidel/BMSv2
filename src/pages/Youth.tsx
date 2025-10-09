import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import { ColumnDef } from "@tanstack/react-table";
import { Trash, Users, GraduationCap, Briefcase, HandHelping, Vote, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Youth } from "@/types/apitypes";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useDeleteYouth } from "@/features/api/youth/useDeleteYouth";
import { useYouth } from "@/features/api/youth/useYouth";
import searchYouth from "@/service/youth/searchYouth";
import { youthSort } from "@/service/youth/youthSort";
import SummaryCardYouth from "@/components/summary-card/youth";
import { YouthPDF } from "@/components/pdf/youthpdf";
import AddYouthModal from "@/features/youth/addYouthModal";
import ViewYouthModal from "@/features/youth/viewYouthModal";

const filters = [
  "All Youth",
  "Alphabetical",
  "In School Youth",
  "Out of School Youth",
  "Working Youth",
  "Youth w/ Specific Needs",
  "SK Voters",
];

const columns: ColumnDef<Youth>[] = [
  {
    header: "Full Name",
    cell: ({ row }) => {
      const y = row.original;
      const middle = y.Middlename || "";
      const fullName = `${y.Lastname}, ${y.Firstname} ${middle} ${y.Suffix || ""}`;
      return <div>{fullName}</div>;
    },
  },
  { header: "Gender", accessorKey: "Gender" },
  { header: "Zone", accessorKey: "Zone" },
  { header: "Email", accessorKey: "EmailAddress" },
  { header: "Contact", accessorKey: "ContactNumber" },
  { header: "Education", accessorKey: "EducationalBackground" },
  { header: "Work Status", accessorKey: "WorkStatus" },
];

export default function YouthPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYouth, setSelectedYouth] = useState<number[]>([]);
  const deleteMutation = useDeleteYouth();
  const { data: youthData } = useYouth();
  const queryClient = useQueryClient();
  const [viewYouthId, setViewYouthId] = useState<number | null>(null);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const filteredData = useMemo(() => {
    if (!youthData?.youths) return [];
    const sortValue = searchParams.get("sort") ?? "All Youth";
    let sorted = youthSort(youthData.youths, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = searchYouth(query, sorted);
    }

    return sorted ?? [];
  }, [searchParams, searchQuery, youthData]);

  const res = youthData?.youths || [];
  const total = res.length;
  const inSchool = res.filter((r) => r.InSchoolYouth).length;
  const outOfSchool = res.filter((r) => r.OutOfSchoolYouth).length;
  const working = res.filter((r) => r.WorkingYouth).length;
  const withNeeds = res.filter((r) => r.YouthWithSpecificNeeds).length;
  const skVoters = res.filter((r) => r.IsSKVoter).length;

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardYouth
          title="Total Youth"
          value={total}
          icon={<Users size={50} />}
          onClick={async () => {
            const blob = await pdf(<YouthPDF filter="All Youth" youths={res} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            await writeFile("YouthRecords.pdf", contents, { baseDir: BaseDirectory.Document });
            toast.success("Youth Records downloaded", { description: "Saved in Documents folder" });
          }}
        />
        <SummaryCardYouth title="In School" value={inSchool} icon={<GraduationCap size={50} />} />
        <SummaryCardYouth title="Out of School" value={outOfSchool} icon={<Users size={50} />} />
        <SummaryCardYouth title="Working Youth" value={working} icon={<Briefcase size={50} />} />
        <SummaryCardYouth title="With Specific Needs" value={withNeeds} icon={<HandHelping size={50} />} />
        <SummaryCardYouth title="SK Voters" value={skVoters} icon={<Vote size={50} />} />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search Youth"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Youth"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => {
            if (selectedYouth) {
              toast.promise(deleteMutation.mutateAsync(selectedYouth), {
                loading: "Deleting youth, please wait...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["youth"] });
                  setRowSelection({});
                  setSelectedYouth([]);
                  return { message: "Youth successfully deleted" };
                },
                error: (error: { error: string }) => ({
                  message: "Failed to delete youth",
                  description: error.error,
                }),
              });
            }
          }}
        >
          <Trash /> Delete Selected
        </Button>
        <AddYouthModal />
      </div>

      <DataTable<Youth>
        classname="py-5"
        height="43.3rem"
        data={filteredData || []}
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
                    const allVisible = table.getRowModel().rows.map((row) => row.original.ID);
                    setSelectedYouth(allVisible);
                  } else {
                    setSelectedYouth([]);
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
                    setSelectedYouth((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedYouth((prev) => prev.filter((id) => id !== row.original.ID));
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
                <Button onClick={() => setViewYouthId(row.original.ID)}>
                  <Eye /> View Youth
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {viewYouthId !== null && (
        <ViewYouthModal
          youth={youthData.youths.find((e) => e.ID === viewYouthId)}
          open={true}
          onClose={() => setViewYouthId(null)}
        />
      )}
    </>
  );
}
