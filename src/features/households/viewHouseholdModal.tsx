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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Household } from "@/types/apitypes";
import { Eye } from "lucide-react";
import { getRoleIcon } from "./addHouseholdModal";
import EditHouseholdModal from "./editHouseholdModal";

export default function ViewHouseholdModal({
  household,
  open,
  onClose,
}: {
  household: Household;
  open: boolean;
  onClose: () => void;
}) {
  const overallIncome = household?.member?.reduce(
    (sum, m) => sum + (m.Income || 0),
    0
  );
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button>
            <Eye />
            View More
          </Button>
        </DialogTrigger>
        <DialogContent className="text-black">
          <DialogHeader className="text-xl font-bold">
            <DialogTitle>Household Information</DialogTitle>
            <DialogDescription>
              This shows the general information about a household
            </DialogDescription>
            <div className="flex w-full  flex-col gap-6">
              <Tabs defaultValue="general">
                <TabsList className="text-black">
                  <TabsTrigger
                    value="general"
                    className="text-black data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    General Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="edit"
                    className="text-black data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Edit Household
                  </TabsTrigger>
                  {/*<TabsTrigger value="" className="text-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">Family Tree</TabsTrigger>*/}
                </TabsList>
                <TabsContent value="general">
                  <div className="flex w-full justify-between">
                    <p className="text-sm">Members</p>
                    <p className="text-sm">{`Overall Income: ${Math.trunc(
                      overallIncome
                    ).toLocaleString("en-US")}`}</p>
                  </div>
                  <Table className="w-full">
                    <TableCaption>{`Household details for Household Number ${household.household_number}. Roles are displayed relative to their relationship with the household head`}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-black">Role</TableHead>
                        <TableHead className="text-black">Name</TableHead>
                        <TableHead className="text-black">
                          Estimated Income
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {household?.member?.map((m) => {
                        const RoleIcon = getRoleIcon(m.Role);
                        return (
                          <TableRow key={m.ID}>
                            <TableCell>
                              <div className="flex gap-3 items-center">
                                <RoleIcon />
                                {m.Role}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {m.Firstname + " " + m.Lastname}
                            </TableCell>
                            <TableCell>
                              {m.Income
                                ? Math.trunc(m.Income).toLocaleString("en-US")
                                : 0}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="edit">
                  <EditHouseholdModal
                    household={{
                      ID: household.id, // ensure ID is passed
                      HouseholdNumber: household.household_number,
                      Type: household.type,
                      Members: household?.member?.map((m) => ({
                        ID: m.ID,
                        Role: m.Role,
                      })),
                      Zone: household.zone,
                      DateOfResidency: household?.date?.toISOString(), // ensure string
                      Status: household.status,
                    }}
                    onClose={onClose}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
