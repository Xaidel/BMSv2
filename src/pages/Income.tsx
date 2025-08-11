import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddIncomeModal from "@/features/income/addIncomeModal";
import DeleteIncomeModal from "@/features/income/deleteIncomeModal";
import ViewIncomeModal from "@/features/income/viewIncomeModal";
import { sort } from "@/service/income/incomeSort";
import type { Income } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Shirt, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DollarSign,
  Banknote,
  PiggyBank,
  Gift,
  Coins,
  Wallet,
  Layers,
} from "lucide-react"; // or custom icons
import SummaryCardIncome from "@/components/summary-card/income";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { IncomePDF } from "@/components/pdf/incomepdf";
import searchIncome from "@/service/income/searchIncome";

const filters = [
  "All Income",
  "Numerical",
  "Date Issued",
  "This Month",
  "This Week",
];

const columns: ColumnDef<Income>[] = [
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
  { header: "Type", accessorKey: "type_" },
  { header: "Category", accessorKey: "category" },
  { header: "OR Number", accessorKey: "or_number" },
  {
    header: "Amount", accessorKey: "amount",
    cell: ({ row }) => <div>{Intl.NumberFormat("en-US").format(row.original.amount)}</div>
  },
  { header: "Received From", accessorKey: "received_from" },
  { header: "Received By", accessorKey: "received_by" },
  {
    header: "Date Issued",
    accessorKey: "date",
    cell: ({ row }) => (
      <div>
        {row.original.date
          ? format(row.original.date, "MMMM do, yyyy")
          : "Invalid Date"}
      </div>
    ),
  },
];

export default function IncomePage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]); //

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(data, searchParams.get("sort") ?? "All Income");
    if (searchQuery.trim()) {
      return searchIncome(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, data, searchQuery]);

  const fetchIncomes = () => {
    invoke<Income[]>("fetch_all_incomes_command")
      .then((fetched) => {
        const parsed = fetched.map((income) => ({
          ...income,
          date: new Date(income.date),
          category: income.category,
        }));
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch incomes:", err));
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  <AddIncomeModal onSave={fetchIncomes} />;

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      console.error("No income records selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_income_command", { id });
        }
      }
      console.log("Selected incomes deleted.");
      fetchIncomes();
      setRowSelection({});
    } catch (err) {
      console.error("Failed to delete selected incomes", err);
    }
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardIncome
          title="Total Revenue"
          value={new Intl.NumberFormat("en-US").format(filteredData.reduce((acc, item) => acc + item.amount, 0))}
          icon={<DollarSign size={50} />}
          onClick={async () => {
            const blob = await pdf(<IncomePDF filter="All Income" incomes={filteredData} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile('IncomeRecords.pdf', contents, {
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
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Local Revenue")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Banknote size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Local Revenue");
            const blob = await pdf(<IncomePDF filter="Local Revenue" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("LocalRevenue.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Local Revenue PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Local Revenue PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Tax Revenue"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Tax Revenue")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<PiggyBank size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Tax Revenue");
            const blob = await pdf(<IncomePDF filter="Tax Revenue" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("TaxRevenue.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Tax Revenue PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Tax Revenue PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Government Grants"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Government Grants")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Gift size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Government Grants");
            const blob = await pdf(<IncomePDF filter="Government Grants" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("GovernmentGrants.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Government Grants PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Government Grants PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Service Revenue"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Service Revenue")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Coins size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Service Revenue");
            const blob = await pdf(<IncomePDF filter="Service Revenue" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ServiceRevenue.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Service Revenue PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Service Revenue PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Rental Income"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Rental Income")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Wallet size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Rental Income");
            const blob = await pdf(<IncomePDF filter="Rental Income" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("RentalIncome.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Rental Income PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Rental Income PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Government Funds (IRA)"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Government Funds")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Layers size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Government Funds");
            const blob = await pdf(<IncomePDF filter="Government Funds" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("GovernmentFunds.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Government Funds PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Government Funds PDF" });
            }
          }}
        />
        <SummaryCardIncome
          title="Others"
          value={Intl.NumberFormat("en-US").format(filteredData
            .filter((d) => d.category === "Others")
            .reduce((acc, item) => acc + item.amount, 0))}
          icon={<Shirt size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Others");
            const blob = await pdf(<IncomePDF filter="Others" incomes={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("Others.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Others PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Others PDF" });
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
          disabled={Object.keys(rowSelection).length === 0}
          onClick={handleDeleteSelected}
        >
          <Trash />
          Delete Selected
        </Button>
        <AddIncomeModal onSave={fetchIncomes} />
      </div>

      {/* Data Table */}
      <DataTable<Income>
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
                <ViewIncomeModal {...row.original} onSave={fetchIncomes} />
                <DeleteIncomeModal
                  id={row.original.id!}
                  type_={row.original.type_}
                  category={row.original.category}
                  onDelete={fetchIncomes}
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
