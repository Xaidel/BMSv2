import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Feature } from "geojson"
import { useHouseholdByID } from "../api/household/useHousehold"
import { useMemo } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getRoleIcon } from "../households/addHouseholdModal"



export default function AddMappingModal({ feature, dialogOpen, onOpenChange }: { feature: Feature, dialogOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const type = feature?.properties?.type || "none"
  const id = feature?.properties?.household_id
  const { data: household } = useHouseholdByID(id)

  const data = useMemo(() => {
    if (!household) return null
    return household.household
  }, [household])

  const overallIncome = data?.residents?.reduce((sum, member) => sum + (member.income || 0), 0);
  const renderContent = () => {
    switch (type) {
      case "household":
        return (
          <>
            <div className="flex w-full justify-between font-bold">
              <div className="flex w-full justify-between">
                <p className="text-sm">Members</p>
                <p className="text-sm">{`Overall Income: ${Math.trunc(overallIncome).toLocaleString("en-US")}`}</p>
              </div>
            </div>
            <Table className="w-full">
              <TableCaption >{`Household details for Household Number ${data?.household_number}. Roles are displayed relative to their relationship with the household head`}</TableCaption>
              <TableHeader>
                <TableRow >
                  <TableHead className="text-black" >
                    Role
                  </TableHead>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Estimated Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.residents.map((m) => {
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
          </>
        )
      case "establishment":
        return (
          <></>
        )
      default:
        return (
          <></>
        )
    }
  }
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="text-black">
          <DialogTitle>Barangay Tambo Mapping</DialogTitle>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  )
}
