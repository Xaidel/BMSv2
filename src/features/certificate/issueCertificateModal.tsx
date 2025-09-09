import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Certificate = {
  type: string;
  path: string;
};

const data: Certificate[] = [
  { type: "4PS Certificate", path: "fourps" }, // done
  { type: "Barangay Residency Certificate", path: "brgy-residency" }, // done
  { type: "Barangay Clearance Certificate", path: "brgy-clearance" }, // done
  { type: "Barangay Indigency Certificate", path: "brgy-indigency" }, // done
  { type: "Barangay Business Permit", path: "brgy-business-permit" }, // done
  { type: "Barangay Business Clearance", path: "brgy-business-clearance" }, // done
  { type: "Marriage Certificate", path: "cert-marriage" }, // done
  { type: "Ownership Certificate", path: "cert-ownership" }, // done
  { type: "Registration of Birth", path: "registration-birth" }, // done
  { type: "Solo Parent Certificate", path: "cert-solo" }, //done
  { type: "Unemployment Certificate", path: "cert-unemployment" }, //done
  { type: "Certification of First Job Seeker", path: "cert-job" }, // done
  // { type: "Certification of BARC", path: "cert-barc" },
  // { type: "Certification of Blood", path: "cert-blood" },
  // { type: "Certification of Cut Tree", path: "cert-cut" },
  // { type: "Certification of Farmers", path: "cert-farmer" },
  // { type: "Certification of Good Moral", path: "cert-moral" },
  // { type: "Certification of Non Existing Business", path: "cert-non" },
  // { type: "Certification of Organization", path: "cert-org" },
  // { type: "Certification of PWD", path: "cert-pwd" },
  // { type: "Certification of Relationship", path: "cert-relationship" },
  // { type: "Certification of Residing", path: "cert-residing" },
  // { type: "Certification of SSS", path: "cert-sss" },
  // { type: "Certification of Same Person", path: "cert-same" },
  // { type: "Certification of Shelter Damage", path: "cert-shelter" },
  // { type: "Certification of Tenant Cultivation", path: "cert-tenant" },
];

export default function IssueCertificateModal() {
  const navigate = useNavigate();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Issue Certificate
          </Button>
        </DialogTrigger>
        <DialogContent className="py-5 px-0 flex flex-col gap-0 max-h-[30rem] overflow-hidden">
          <div className="sticky top-0 z-10 p-6 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-black">
                Select Certificate Type
              </DialogTitle>
              <DialogDescription>
                Please choose the type of certificate you'd like to generate.
                This helps us customize the content and layout based on your
                selection.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="px-6">
              <Table>
                <TableCaption>Certificate services being offered.</TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="text-black bg-background">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((cert, i) => (
                    <TableRow key={i} className="text-black">
                      <TableCell>
                        <div className="flex justify-between items-center">
                          {cert.type}
                          <Button
                            onClick={() =>
                              navigate(`/certificates/template/${cert.path}`)
                            }
                          >
                            Select
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
