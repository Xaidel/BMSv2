import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Household } from "@/types/types";
import { Eye } from "lucide-react";
import { getRoleIcon } from "./addHouseholdModal";
import { buildFamilyTree } from "@/types/tree";
import FamilyTree from "react-family-tree"

export default function ViewHouseholdModal({ household, open, onClose }: { household: Household, open: boolean, onClose: () => void }) {
  const overallIncome = household.members.reduce((sum, member) => sum + (member.income || 0), 0);
  const nodes = buildFamilyTree(household)
  const root = nodes.find((n) => n.parents.length === 0)
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button>
            <Eye />View More
          </Button>
        </DialogTrigger>
        <DialogContent className="text-black">
          <DialogHeader className="text-xl font-bold">
            <DialogTitle>
              Household Information
            </DialogTitle>
            <DialogDescription >This shows the general information about a household</DialogDescription>
            <div className="flex w-full  flex-col gap-6">
              <Tabs defaultValue="general" >
                <TabsList className="text-black">
                  <TabsTrigger value="general" className="text-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">General Info</TabsTrigger>
                  <TabsTrigger value="tree" className="text-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">Family Tree</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                  <div className="flex w-full justify-between">
                    <p className="text-sm">Members</p>
                    <p className="text-sm">{`Overall Income: ${Math.trunc(overallIncome).toLocaleString("en-US")}`}</p>
                  </div>
                  <Table className="w-full">
                    <TableCaption >{`Household details for Househol Number ${household.household_number}`}</TableCaption>
                    <TableHeader>
                      <TableRow >
                        <TableHead className="text-black" >
                          Role</TableHead>
                        <TableHead className="text-black">Name</TableHead>
                        <TableHead className="text-black">Estimated Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {household.members.map((m) => {
                        const RoleIcon = getRoleIcon(m.role)
                        return (
                          <TableRow key={m.id}>
                            <TableCell>
                              <div className="flex gap-3 items-center">
                                <RoleIcon />
                                {m.role}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{m.firstname + " " + m.lastname}</TableCell>
                            <TableCell>{m.income ? Math.trunc(m.income).toLocaleString("en-US") : 0}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="tree">
                  <div style={{ width: "100%", height: "600px" }}>
                    {!root && <div>No root found</div>}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
