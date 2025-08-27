import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  DollarSign,
  Banknote,
  PiggyBank,
  Coins,
  Wallet,
  Layers,
  Shirt,
  Trash,
  Eye,
  Droplets,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";

import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import AddIncomeModal from "@/features/income/addIncomeModal";
import ViewIncomeModal from "@/features/income/viewIncomeModal";

import { useIncome } from "@/features/api/income/useIncome";
import { useDeleteIncome } from "@/features/api/income/useDeleteIncome";
import { IncomePDF } from "@/components/pdf/incomepdf";
import SummaryCardIncome from "@/components/summary-card/income";
import searchIncome from "@/service/income/searchIncome";
import { sort } from "@/service/income/incomeSort";
import { Income } from "@/types/apitypes";

const filters = [
  "All Income",
  "Numerical",
  "Date Issued",
  "This Month",
  "This Week",
];

const columns: ColumnDef<Income>[] = [
  { header: "Type", accessorKey: "Type" },
  { header: "Category", accessorKey: "Category" },
  { header: "OR Number", accessorKey: "OR" },
  {
    header: "Amount",
    accessorKey: "Amount",
    cell: ({ row }) => (
      <div>{Intl.NumberFormat("en-US").format(row.original.Amount)}</div>
    ),
  },
  { header: "Received From", accessorKey: "ReceivedFrom" },
  { header: "Received By", accessorKey: "ReceivedBy" },
  {
    header: "Date Issued",
    accessorKey: "DateReceived",
    cell: ({ row }) => (
      <div>
        {row.original.DateReceived
          ? format(row.original.DateReceived, "MMMM do, yyyy")
          : "Invalid Date"}
      </div>
    ),
  },
];

export default function IncomeNewPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncome, setSelectedIncome] = useState<number[]>([]);
  const { data: incomeResponse } = useIncome();
  const { mutateAsync: deleteIncome } = useDeleteIncome();

  const income = useMemo(() => {
    return incomeResponse?.incomes ?? [];
  }, [incomeResponse]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(income, searchParams.get("sort") ?? "All Income");
    if (searchQuery.trim()) {
      return searchIncome(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, income, searchQuery]);
  const [viewIncomeId, setViewIncomeId] = useState<number | null>(null);

  return (
    <>
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardIncome
          title="Total Revenue"
          value={new Intl.NumberFormat("en-US").format(
            filteredData.reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<DollarSign size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <IncomePDF filter="All Income" incomes={filteredData} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("IncomeRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Income Record successfully downloaded", {
                description: "Income record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Income record",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Local Revenue"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Local Revenue")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Banknote size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Local Revenue"
            );
            const blob = await pdf(
              <IncomePDF filter="Local Revenue" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("LocalRevenue.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Local Revenue PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Local Revenue PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Tax Revenue"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Tax Revenue")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<PiggyBank size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Tax Revenue"
            );
            const blob = await pdf(
              <IncomePDF filter="Tax Revenue" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("TaxRevenue.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Tax Revenue PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Tax Revenue PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Water System"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Water System")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Droplets size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Water System"
            );
            const blob = await pdf(
              <IncomePDF filter="Water System" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("GovernmentGrants.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Water System PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Water System PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Service Revenue"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Service Revenue")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Coins size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Service Revenue"
            );
            const blob = await pdf(
              <IncomePDF filter="Service Revenue" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ServiceRevenue.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Service Revenue PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Service Revenue PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Rental Income"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Rental Income")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Wallet size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Rental Income"
            );
            const blob = await pdf(
              <IncomePDF filter="Rental Income" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("RentalIncome.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Rental Income PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Rental Income PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Government Funds (IRA)"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Government Funds")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Layers size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Government Funds"
            );
            const blob = await pdf(
              <IncomePDF filter="Government Funds" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("GovernmentFunds.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Government Funds PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Government Funds PDF",
              });
            }
          }}
        />
        <SummaryCardIncome
          title="Others"
          value={Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Others")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Shirt size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter(
              (d) => d.Category === "Others"
            );
            const blob = await pdf(
              <IncomePDF filter="Others" incomes={filtered} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("Others.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Others PDF saved", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save Others PDF",
              });
            }
          }}
        />
      </div>

      {/* Search + Filter */}
      <div className="flex gap-5 w-full items-center justify-center mb-0">
        <Searchbar
          placeholder="Search Income"
          onChange={handleSearch}
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Income"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={selectedIncome.length === 0}
          onClick={() => {
            if (selectedIncome.length > 0) {
              toast.promise(deleteIncome(selectedIncome), {
                loading: "Deleting selected incomes. Please wait",
                success: () => {
                  setSelectedIncome([]);
                  setRowSelection({});
                  return {
                    message: "Selected incomes deleted successfully",
                  };
                },
                error: () => {
                  return {
                    message: "Failed to delete selected incomes",
                  };
                },
              });
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddIncomeModal />
      </div>

      {/* Data Table */}
      <DataTable<Income>
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
                    setSelectedIncome(allVisibleRows);
                  } else {
                    setSelectedIncome([]);
                  }
                }}
                aria-label="Select all"
                className="flex items-center justify-center"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={selectedIncome.includes(row.original.ID)}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedIncome((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedIncome((prev) =>
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
                <Button onClick={() => setViewIncomeId(row.original.ID)}>
                  <Eye /> View Event
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
          setSelectedIncome(selectedIds);
        }}
      />
      {viewIncomeId !== null && (
        <ViewIncomeModal
          income={income.find((e) => e.ID === viewIncomeId)}
          open={true}
          onClose={() => setViewIncomeId(null)}
        />
      )}
    </>
  );
}
