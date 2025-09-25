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

type BlotterDoc = {
  type: string;
  path: string;
};

const data: BlotterDoc[] = [
  { type: "Summons Letter", path: "summon" }, // done
  { type: "Notice of Hearing Letter", path: "notice" }, // done
  
];

export default function IssueBlotterModal() {
  const navigate = useNavigate();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Add Letter
          </Button>
        </DialogTrigger>
        <DialogContent className="py-5 px-0 flex flex-col gap-0 max-h-[30rem] overflow-hidden">
          <div className="sticky top-0 z-10 p-6 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-black">
                Select Blotter Document
              </DialogTitle>
              <DialogDescription>
                Please choose the type of blotter document you'd like to generate.
                This helps us customize the content and layout based on your
                selection.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="px-6">
              <Table>
                <TableCaption>Blotter documents available.</TableCaption>
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
                              navigate(`/blotter/template/${cert.path}`)
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
