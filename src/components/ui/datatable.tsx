import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableCell, TableHead, TableRow } from "./table";
import { TableVirtuoso } from "react-virtuoso";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  classname?: string;
  height?: string;
  rowSelection?: Record<number, boolean>;
  onRowSelectionChange?: (
    updater:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
};

export default function DataTable<T>({
  columns,
  data,
  height,
  classname,
  rowSelection,
  onRowSelectionChange,
}: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection, // ✅ hook up state
    },
    onRowSelectionChange, // ✅ hook up state updater
    enableRowSelection: true, // ✅ explicitly enable selection
  });

  const { rows } = table.getRowModel();

  const TableRowComponent = (rows: Row<T>[]) =>
    function getTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
      const index = props["data-index"] as number;
      const row = rows[index];
      if (!row) return null;

      return (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          {...props}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    };

  return (
    <div className={cn("rounded-md", classname)}>
      <TableVirtuoso
        style={{ height }}
        totalCount={rows.length}
        components={{
          Table: Table,
          TableRow: TableRowComponent(rows),
        }}
        fixedHeaderContent={() =>
          table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="z-20 bg-background" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                  className="text-black bg-transparent py-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))
        }
      />
    </div>
  );
}
