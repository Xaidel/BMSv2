import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddExpenseModal from "@/features/expense/addExpenseModal";
import DeleteExpenseModal from "@/features/expense/deleteExpenseModal";
import ViewExpenseModal from "@/features/expense/viewExpenseModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, Banknote, Landmark, Layers, PiggyBank, DollarSign, Wallet, Salad, Shirt } from "lucide-react";
import type { Expense } from "@/types/types";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { sort } from "@/service/expense/expenseSort";
import searchExpense from "@/service/expense/searchExpense";
import SummaryCardExpense from "@/components/summary-card/expense";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { ExpensePDF } from "@/components/pdf/expensepdf";

const filters = [
  "All Expense",
  "Numerical",
  "Date Issued",
  "This Month",
  "This Week",
];

const columns: ColumnDef<Expense>[] = [
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
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
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
    header: "Type",
    accessorKey: "type_",
  },
  {
    header: "Category",
    accessorKey: "category",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => <div>{Intl.NumberFormat("en-US").format(row.original.amount)}</div>
  },
  {
    header: "Paid From",
    accessorKey: "paid_to",
  },
  {
    header: "Paid By",
    accessorKey: "paid_by",
  },
  {
    header: "Date Issued",
    accessorKey: "date",
    cell: ({ row }) => {
      return (
        <div>{format(row.original.date, "MMMM do, yyyy")}</div>
      );
    },
  },
];


export default function Expense() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Expense[]>([]);

  const fetchExpenses = () => {
    invoke<Expense[]>("fetch_all_expenses_command")
      .then((fetched) => {
        const parsed = fetched.map((expense) => ({
          ...expense,
          date: new Date(expense.date),
          category: expense.category,
        }));
        setData(parsed);
      })
      .catch((err) => console.error("Failed to fetch expenses:", err));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  <AddExpenseModal onSave={fetchExpenses} />;

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(data, searchParams.get("sort") ?? "All Expense");
    if (searchQuery.trim()) {
      return searchExpense(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, data, searchQuery]);

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((key) => filteredData[parseInt(key)])
      .filter((row) => !!row)
      .map((row) => row.id);

    if (selectedIds.length === 0) {
      console.error("No expense records selected.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (id !== undefined) {
          await invoke("delete_expense_command", { id });
        }
      }
      console.log("Selected expenses deleted.");
      fetchExpenses();
      setRowSelection({});
    } catch (err) {
      console.error("Failed to delete selected expenses", err);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardExpense
          title="Total Expenditure"
          value={new Intl.NumberFormat("en-US").format(filteredData.reduce((acc, item) => acc + item.amount, 0))}
          icon={<DollarSign size={50} />}
          onClick={async () => {
            const blob = await pdf(<ExpensePDF filter="All Expenses" expenses={filteredData} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ExpenseRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Expense Record successfully downloaded", {
                description: "Expense record is saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the Expense record",
              });
            }
          }}
        />
        <SummaryCardExpense
          title="Infrastructure Expenses"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Infrastructure")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Landmark size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Infrastructure");
            const blob = await pdf(<ExpensePDF filter="Infrastructure Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("InfrastructureExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Infrastructure Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Infrastructure Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="Honoraria"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Honoraria")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<PiggyBank size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Honoraria");
            const blob = await pdf(<ExpensePDF filter="Honoraria Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("HonorariaExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Honoraria Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Honoraria Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="Utilities"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Utilities")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Wallet size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Utilities");
            const blob = await pdf(<ExpensePDF filter="Utilities Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("UtilitiesExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Utilities Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Utilities Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="Local Funds Used"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Local Funds")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Banknote size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Local Funds");
            const blob = await pdf(<ExpensePDF filter="Local Funds Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("LocalFundsExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Local Funds Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Local Funds Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="Foods"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Foods")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Salad size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Foods");
            const blob = await pdf(<ExpensePDF filter="Foods Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("FoodsExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Foods Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Foods Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="IRA Used"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "IRA")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Layers size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "IRA");
            const blob = await pdf(<ExpensePDF filter="IRA Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("IRAExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("IRA Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save IRA Expenses PDF" });
            }
          }}
        />
        <SummaryCardExpense
          title="Others"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.category === "Others")
              .reduce((acc, item) => acc + item.amount, 0)
          )}
          icon={<Shirt size={50} />}
          onClick={async () => {
            const filtered = filteredData.filter((d) => d.category === "Others");
            const blob = await pdf(<ExpensePDF filter="Other Expenses" expenses={filtered} />).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("OtherExpenses.pdf", contents, { baseDir: BaseDirectory.Document });
              toast.success("Other Expenses PDF saved", { description: "Saved in Documents folder" });
            } catch (e) {
              toast.error("Error", { description: "Failed to save Other Expenses PDF" });
            }
          }}
        />
      </div>


      <div className="flex gap-5 w-full items-center justify-center mb-4">
        <Searchbar
          placeholder="Search Expense"
          classname="flex flex-5"
          onChange={handleSearch}
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Expense"
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
        <AddExpenseModal onSave={fetchExpenses} />
      </div>

      <DataTable<Expense>
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
                <ViewExpenseModal {...row.original} onSave={fetchExpenses} />
                <DeleteExpenseModal
                  id={row.original.id!}
                  type_={row.original.type_}
                  category={row.original.category}
                  onDelete={fetchExpenses}
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
