import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddProgramProjectModal from "@/features/program_project/addProgramProjectModal";
import ViewProgramProjectModal from "@/features/program_project/viewProgramProjectModal";
import { sort } from "@/service/program_project/programProjectSort";
import searchProgramProject from "@/service/program_project/searchProgramProject";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, CalendarPlus, CalendarCheck, CalendarX2, CalendarClock, Eye, } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProgramProject } from "@/types/apitypes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useProgramProject } from "@/features/api/program_project/useProgramProject";
import { useDeleteProgramProject } from "@/features/api/program_project/useDeleteProgramProject";
import { ProgramProjectPDF } from "@/components/pdf/program_projectpdf";
import SummaryCardProgramProject from "@/components/summary-card/project_program";


const filters = [
  "All Records",
  "Start Date ASC",
  "Start Date DESC",
  "End Date ASC",
  "End Date DESC",
  "Ongoing",
  "Completed",
  "Planned",
  "Cancelled",
];

const columns: ColumnDef<ProgramProject>[] = [
  {
    header: "Name",
    accessorKey: "Name",
  },
  {
    header: "Type",
    accessorKey: "Type",
  },
  {
    header: "Start Date",
    accessorKey: "StartDate",
    cell: ({ row }) => {
      return <div>{format(row.original.StartDate, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "End Date",
    accessorKey: "EndDate",
    cell: ({ row }) => {
      return <div>{format(row.original.EndDate, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Location",
    accessorKey: "Location",
  },
  {
    header: "Project Manager",
    accessorKey: "ProjectManager",
  },
  {
    header: "Budget",
    accessorKey: "Budget",
    cell: ({ row }) => {
      return <div>₱{row.original.Budget.toLocaleString()}</div>;
    },
  },
  {
    header: "Status",
    accessorKey: "Status",
    cell: ({ row }) => {
      const status = row.original.Status;
      let color: string;
      switch (status) {
        case "Ongoing": {
          color = "#BD0000";
          break;
        }
        case "Planned": {
          color = "#FFB30F";
          break;
        }
        case "Cancelled": {
          color = "#000000";
          break;
        }
        case "Completed": {
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

export default function ProgramProjects() {
  const user = sessionStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [selectedProgramProject, setSelectedProgramProject] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: programProjectResponse } = useProgramProject();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProgramProject();
  const programProjects = useMemo(() => {
    return programProjectResponse?.program_projects ?? [];
  }, [programProjectResponse]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredData = useMemo(() => {
    const sortedData = sort(programProjects, searchParams.get("sort") ?? "All Records");

    if (searchQuery.trim()) {
      return searchProgramProject(searchQuery, sortedData);
    }

    return sortedData;
  }, [searchParams, programProjects, searchQuery]);
  const total = programProjects.length;
  const completed = programProjects.filter((d) => d.Status === "Completed").length;
  const ongoing = programProjects.filter((d) => d.Status === "Ongoing").length;
  const cancelled = programProjects.filter((d) => d.Status === "Cancelled").length;
  const [viewProgramProjectId, setViewProgramProjectId] = useState<number | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardProgramProject
          title="Total Records"
          value={total}
          icon={<CalendarClock size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <ProgramProjectPDF filter="All Records" programProjects={programProjects} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ProgramProjectRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Program/Project Record successfully downloaded", {
                description: "Record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Program/Project record",
              });
            }
          }}
        />
        <SummaryCardProgramProject
          title="Ongoing"
          value={ongoing}
          icon={<CalendarPlus size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <ProgramProjectPDF filter="Ongoing" programProjects={programProjects.filter((e) => e.Status === "Ongoing")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("OngoingProgramProjects.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Ongoing Program/Projects PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Ongoing Program/Projects PDF",
              });
            }
          }}
        />
        <SummaryCardProgramProject
          title="Completed"
          value={completed}
          icon={<CalendarCheck size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <ProgramProjectPDF filter="Completed" programProjects={programProjects.filter((e) => e.Status === "Completed")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("CompletedProgramProjects.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Completed Program/Projects PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Completed Program/Projects PDF",
              });
            }
          }}
        />
        <SummaryCardProgramProject
          title="Cancelled"
          value={cancelled}
          icon={<CalendarX2 size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <ProgramProjectPDF filter="Cancelled" programProjects={programProjects.filter((e) => e.Status === "Cancelled")} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("CancelledProgramProjects.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Cancelled Program/Projects PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Cancelled Program/Projects PDF",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={handleSearch}
          placeholder="Search Program/Project"
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
            if (selectedProgramProject) {
              toast.promise(deleteMutation.mutateAsync(selectedProgramProject), {
                loading: "Deleting program/projects. Please wait",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["programProjects"] });
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedProgramProject.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    console.log(newSelection);
                    return newSelection;
                  });
                  setSelectedProgramProject([]);
                  return {
                    message: "Program/Project successfully deleted",
                  };
                },
                error: (error: ErrorResponse) => {
                  return {
                    message: "Failed to delete program/project",
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
        <AddProgramProjectModal />
      </div>

      <DataTable<ProgramProject>
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
                    setSelectedProgramProject(allVisibleRows);
                  } else {
                    setSelectedProgramProject([]);
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
                    setSelectedProgramProject((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedProgramProject((prev) =>
                      prev.filter((programProject) => programProject !== row.original.ID)
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
                  <Button onClick={() => setViewProgramProjectId(row.original.ID)}>
                    <Eye /> View Program/Project
                  </Button>
                </div>
              );
            },
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewProgramProjectId !== null && (
        <ViewProgramProjectModal
          programProject={programProjects.find((e) => e.ID === viewProgramProjectId)}
          open={true}
          onClose={() => setViewProgramProjectId(null)}
        />
      )}
    </>
  );
}
