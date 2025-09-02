import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { BaseDirectory, writeFile } from "@tauri-apps/plugin-fs";
import { pdf } from "@react-pdf/renderer";
import { CertificatePDF } from "@/components/pdf/certificatepdf";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import IssueCertificateModal from "@/features/certificate/issueCertificateModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Trash,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import searchCertificate from "@/service/certificate/searchCertificate";
import SummaryCard from "@/components/summary-card/certificate";
import { invoke } from "@tauri-apps/api/core";
import getCertificate from "@/service/api/certificate/getCertificate";
import getResident from "@/service/api/resident/getResident";

const filters = [
  "All Certificates",
  "Date ASC",
  "Date DESC",
  "Active",
  "Expired",
];

type Certificate = {
  id: number;
  amount?: string;
  resident_name: any;
  name: string;
  type_: string;
  issued_date: Date;
  purpose?: string;
};

const columns: ColumnDef<Certificate>[] = [
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
    header: "Issued To",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "type_",
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
  },
  {
    header: "Issued On",
    accessorKey: "issued_date",
    cell: ({ row }) => <div>{format(row.original.issued_date, "MMMM do, yyyy")}</div>,
  },
  {
    header: "Expires On",
    cell: ({ row }) => {
      const issued = new Date(row.original.issued_date);
      const expiry = new Date(issued);
      expiry.setFullYear(issued.getFullYear() + 1);
      return <div>{format(expiry, "MMMM do, yyyy")}</div>;
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const oneYearLater = new Date(row.original.issued_date);
      oneYearLater.setFullYear(row.original.issued_date.getFullYear() + 1);
      const status = new Date() > oneYearLater ? "Expired" : "Active";
      return <p>{status}</p>;
    },
  },
];

export default function Certificate() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Certificate[]>([]);

  const fetchCertificates = async () => {
    try {
      const [{ certificates }, { residents }] = await Promise.all([
        getCertificate(),
        getResident(),
      ]);

      const residentMap = new Map<number, string>(
        residents.map((r: any) => [r.ID, `${r.Firstname} ${r.Lastname}`])
      );

      const parsed = certificates.map((cert: any) => {
        const issuedDate = new Date(cert.issued_date ?? cert.IssuedDate ?? "");
        const fullName = residentMap.get(cert.resident_id ?? cert.ResidentID) ?? "Unknown";
        return {
          id: cert.id ?? cert.ID ?? 0,
          amount: (cert.amount ?? cert.Amount)?.toString() ?? "",
          resident_name: fullName,
          name: fullName,
          type_: cert.type ?? cert.Type ?? cert.type_ ?? cert.typeName ?? "",
          issued_date: isNaN(issuedDate.getTime()) ? new Date() : issuedDate,
          purpose: cert.purpose ?? cert.Purpose ?? "",
        };
      });
      setData(parsed);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const totalCertificates = data.length;
  const activeCertificates = data.filter((cert) => {
    const expiry = new Date(cert.issued_date);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return new Date() <= expiry;
  }).length;
  const expiredCertificates = data.filter((cert) => {
    const expiry = new Date(cert.issued_date);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return new Date() > expiry;
  }).length;

  const filteredData = useMemo(() => {
    const sortValue = searchParams.get("sort") ?? "All Certificates";

    let sorted = [...data];

    if (sortValue === "Date ASC") {
      sorted.sort((a, b) => a.issued_date.getTime() - b.issued_date.getTime());
    } else if (sortValue === "Date DESC") {
      sorted.sort((a, b) => b.issued_date.getTime() - a.issued_date.getTime());
    } else if (sortValue === "Active") {
      sorted = sorted.filter((cert) => {
        const oneYearLater = new Date(cert.issued_date);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        return new Date() <= oneYearLater;
      });
    } else if (sortValue === "Expired") {
      sorted = sorted.filter((cert) => {
        const oneYearLater = new Date(cert.issued_date);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        return new Date() > oneYearLater;
      });
    }

    if (searchQuery.trim()) {
      return searchCertificate(searchQuery, sorted);
    }

    return sorted;
  }, [searchParams, searchQuery, data]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCard
          title="Total Certificates"
          value={totalCertificates}
          icon={<FileText size={50} />}
          onClick={async () => {
            const blob = await pdf(
              <CertificatePDF filter="All Certificates" certificates={data.map(cert => ({ ...cert, issued_date: cert.issued_date.toISOString() }))} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("CertificateRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Certificate Record successfully downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the certificate record",
              });
            }
          }}
        />
        <SummaryCard
          title="Active Certificates"
          value={activeCertificates}
          icon={<CheckCircle size={50} />}
          onClick={async () => {
            const activeCerts = data.filter((cert) => {
              const expiry = new Date(cert.issued_date);
              expiry.setFullYear(expiry.getFullYear() + 1);
              return new Date() <= expiry;
            });
            const blob = await pdf(
              <CertificatePDF filter="Active Certificates" certificates={activeCerts.map(cert => ({ ...cert, issued_date: cert.issued_date.toISOString() }))} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ActiveCertificateRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Active Certificate Record successfully downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the certificate record",
              });
            }
          }}
        />
        <SummaryCard
          title="Expired Certificates"
          value={expiredCertificates}
          icon={<XCircle size={50} />}
          onClick={async () => {
            const expiredCerts = data.filter((cert) => {
              const expiry = new Date(cert.issued_date);
              expiry.setFullYear(expiry.getFullYear() + 1);
              return new Date() > expiry;
            });
            const blob = await pdf(
              <CertificatePDF filter="Expired Certificates" certificates={expiredCerts.map(cert => ({ ...cert, issued_date: cert.issued_date.toISOString() }))} />
            ).toBlob();
            const buffer = await blob.arrayBuffer();
            const contents = new Uint8Array(buffer);
            try {
              await writeFile("ExpiredCertificateRecords.pdf", contents, {
                baseDir: BaseDirectory.Document,
              });
              toast.success("Expired Certificate Record successfully downloaded", {
                description: "Saved in Documents folder",
              });
            } catch (e) {
              toast.error("Error", {
                description: "Failed to save the certificate record",
              });
            }
          }}
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center mb-4">
        <Searchbar
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search by Name or Type"
          classname="flex flex-5"
        />
        <Filter
          filters={filters}
          onChange={handleSortChange}
          initial="All Certificates"
          classname="flex-1"
        />

        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={async () => {
            const selectedIds = Object.keys(rowSelection)
              .map((key) => filteredData[parseInt(key)])
              .filter((row) => !!row)
              .map((row) => row.id); // make sure we use the 'id'

            if (selectedIds.length === 0) {
              toast.error("No certificates selected.");
              return;
            }

            try {
              for (const id of selectedIds) {
                if (id !== undefined) {
                  await invoke("delete_certificate_command", { id });
                }
              }
              toast.success("Selected certificates deleted.");
              fetchCertificates(); // Refresh the table
              setRowSelection({}); // Reset selection
            } catch (err) {
              toast.error("Failed to delete selected certificates.");
              console.error("Delete error:", err);
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <IssueCertificateModal />
      </div>
      <DataTable<Certificate>
        classname="py-5"
        height="43.3rem"
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        data={filteredData}
      />
    </>
  );
}
