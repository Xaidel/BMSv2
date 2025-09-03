import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  X,
  Plus,
  Search,
  Crown,
  Heart,
  Baby,
  User,
  Users,
  CalendarIcon,
  Shield,
  FileQuestion as CircleQuestionMark,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { cn, getAge } from "@/lib/utils"
import { toast } from "sonner"
import { useResident } from "../api/resident/useResident"
import { useAddHousehold } from "../api/household/useAddHousehold"
import { useQueryClient } from "@tanstack/react-query"

const householdRoles = [
  "Head",
  "Adopted Daughter",
  "Adopted Son",
  "Auntie",
  "Brother",
  "Brother in law",
  "Cousin",
  "Daughter",
  "Daughter in law",
  "Father",
  "Father in law",
  "Friend",
  "Granddaughter",
  "Granddaughter in law",
  "Grandfather",
  "Grandmother",
  "Grandson",
  "Grandson in law",
  "House maid/helper",
  "Mother",
  "Mother in law",
  "Nephew",
  "Niece",
  "Partner",
  "Sister",
  "Son",
  "Son in law",
  "Spouse",
  "Stepbrother",
  "Stepdaughter",
  "Stepdaughter in law",
  "Stepfather",
  "Stepmother",
  "Stepgranddaughter",
  "Stepgranddaughter in law",
  "Stepgrandson",
  "Stepgrandson in law",
  "Stepsister",
  "Stepson",
  "Stepson in law",
  "Tenant",
  "Uncle",
  "Others",
]

const roleDefinitions: Record<string, string> = {
  Head: "Primary household member responsible for major decisions and household management",
  "Adopted Daughter": "Female child who has been legally adopted into the family",
  "Adopted Son": "Male child who has been legally adopted into the family",
  Auntie: "Sister of a parent or spouse of an uncle",
  Brother: "Male sibling sharing the same parents",
  "Brother in law": "Brother of spouse or husband of sibling",
  Cousin: "Child of an aunt or uncle",
  Daughter: "Female offspring of the household head or spouse",
  "Daughter in law": "Wife of a son",
  Father: "Male parent of household members",
  "Father in law": "Father of spouse",
  Friend: "Non-family member living in the household",
  Granddaughter: "Daughter of a son or daughter",
  "Granddaughter in law": "Wife of a grandson",
  Grandfather: "Father of a parent",
  Grandmother: "Mother of a parent",
  Grandson: "Son of a son or daughter",
  "Grandson in law": "Husband of a granddaughter",
  "House maid/helper": "Domestic worker living in the household",
  Mother: "Female parent of household members",
  "Mother in law": "Mother of spouse",
  Nephew: "Son of a sibling",
  Niece: "Daughter of a sibling",
  Partner: "Unmarried romantic partner",
  Sister: "Female sibling sharing the same parents",
  Son: "Male offspring of the household head or spouse",
  "Son in law": "Husband of a daughter",
  Spouse: "Married partner of the household head",
  Stepbrother: "Son of stepparent from previous relationship",
  Stepdaughter: "Daughter of spouse from previous relationship",
  "Stepdaughter in law": "Wife of a stepson",
  Stepfather: "Male spouse of mother who is not biological father",
  Stepmother: "Female spouse of father who is not biological mother",
  Stepgranddaughter: "Granddaughter through step-relationship",
  "Stepgranddaughter in law": "Wife of a stepgrandson",
  Stepgrandson: "Grandson through step-relationship",
  "Stepgrandson in law": "Husband of a stepgranddaughter",
  Stepsister: "Daughter of stepparent from previous relationship",
  Stepson: "Son of spouse from previous relationship",
  "Stepson in law": "Husband of a stepdaughter",
  Tenant: "Person renting space in the household",
  Uncle: "Brother of a parent or husband of an aunt",
  Others: "Other family members or relationships not listed above",
}
interface HouseholdProps {
  HouseholdNumber: string
  HouseholdType: string
  Members: { ID: number; Role: string }[]
  Zone: string
  DateOfResidency: string
  Status: string
}

export const getRoleIcon = (role: string) => {
  const iconMap: Record<string, any> = {
    Head: Crown,
    Spouse: Heart,
    Partner: Heart,
    Son: Baby,
    Daughter: Baby,
    "Adopted Son": Baby,
    "Adopted Daughter": Baby,
    Stepson: Baby,
    Stepdaughter: Baby,
    Father: Shield,
    Mother: Shield,
    Stepfather: Shield,
    Stepmother: Shield,
    Grandfather: Shield,
    Grandmother: Shield,
    Brother: Users,
    Sister: Users,
    "Brother in law": Users,
    Stepbrother: Users,
    Stepsister: Users,
    Uncle: Users,
    Auntie: Users,
    Cousin: Users,
    Nephew: Users,
    Niece: Users,
    "Son in law": Users,
    "Daughter in law": Users,
    "Father in law": Shield,
    "Mother in law": Shield,
    Grandson: Baby,
    Granddaughter: Baby,
    "Grandson in law": Users,
    "Granddaughter in law": Users,
    Stepgrandson: Baby,
    Stepgranddaughter: Baby,
    "Stepgrandson in law": Users,
    "Stepgranddaughter in law": Users,
    "Stepdaughter in law": Users,
    "Stepson in law": Users,
    Friend: User,
    "House maid/helper": User,
    Tenant: User,
    Others: CircleQuestionMark,
  }

  return iconMap[role] || User
}

interface SelectedMember {
  ID: string
  Name: string
  Role: string
  Income: number
  Age: number
}

export default function AddHouseholdModal() {
  const [openModal, setOpenModal] = useState(false)
  const [householdNumber, setHouseholdNumber] = useState("0")
  const [householdType, setHouseholdType] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([])
  const [zone, setZone] = useState("")
  const [dateOfResidency, setDateOfResidency] = useState<Date>()
  const [status, setStatus] = useState("")
  const [showMemberSelection, setShowMemberSelection] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleSearchQuery, setRoleSearchQuery] = useState("")
  const { data: residents } = useResident()
  const addMutation = useAddHousehold()

  const res = useMemo<SelectedMember[]>(() => {
    if (!residents?.residents) return []

    return residents.residents.map((r) => {
      const middleInitial = r.Middlename ? ` ${r.Middlename.charAt(0).toUpperCase()}.` : ""

      return {
        ID: r.ID.toString(),
        Name: `${r.Firstname}${middleInitial} ${r.Lastname}`.trim(),
        Role: "",
        Income: r.AvgIncome,
        Age: getAge(r.Birthday.toString()),
      }
    })
  }, [residents])
  const filteredResidents = res.filter((resident) => resident.Name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredRoles = householdRoles.filter((role) => role.toLowerCase().includes(roleSearchQuery.toLowerCase()))

  const toggleMember = (resident: (typeof res)[0], checked: boolean) => {
    if (checked) {
      setSelectedMembers([
        ...selectedMembers,
        {
          ID: resident.ID,
          Name: resident.Name,
          Role: "Others",
          Income: 0,
          Age: 0,
        },
      ])
    } else {
      setSelectedMembers(selectedMembers.filter((member) => member.ID !== resident.ID))
    }
  }

  const updateMemberRole = (memberId: string, role: string) => {
    setSelectedMembers(selectedMembers.map((member) => (member.ID === memberId ? { ...member, Role: role } : member)))
    setRoleSearchQuery("")
  }

  const hasHeadOfHousehold = () => {
    return selectedMembers.some((member) => member.Role === "Head")
  }
  const queryClient = useQueryClient()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!householdNumber || !householdType || !zone || !dateOfResidency || !status) {
      toast.error("Please fill in all required fields")
      return
    }

    if (selectedMembers.length === 0) {
      toast.error("Please add at least one family member")
      return
    }
    const formData: HouseholdProps = {
      HouseholdNumber: householdNumber,
      HouseholdType: householdType,
      Members: selectedMembers.map((m) => ({
        ID: Number(m.ID),
        Role: m.Role,
      })),
      Zone: zone,
      DateOfResidency: dateOfResidency instanceof Date ? dateOfResidency.toISOString() : "",
      Status: status,
    }
    toast.promise(addMutation.mutateAsync(formData), {
      loading: "Inserting household",
      success: (data) => {
        queryClient.invalidateQueries({ queryKey: ["household"] })
        setOpenModal(false)
        return {
          message: "Household added successfully",
          description: "New Household registered",
        }
      },
      error: (error: { error: string }) => {
        return {
          message: "Error Adding Household",
          description: `${error.error}`,
        }
      },
    })
  }

  return (
    <TooltipProvider>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Add Household
          </Button>
        </DialogTrigger>
        <DialogContent className="text-black max-h-[90vh] flex flex-col p-0">
          <div className="sticky top-0  px-6 pt-4 z-10">
            <DialogHeader>
              <DialogTitle>Add Household</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Fill out all fields to create a new household
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Basic Information</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="household-number" className="text-sm font-medium">
                        Household Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="household-number"
                        name="householdNumber"
                        value={householdNumber}
                        onChange={(e) => setHouseholdNumber(e.target.value)}
                        className="mt-1"
                        placeholder="Enter household number"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm font-medium">
                        Household Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={householdType} onValueChange={setHouseholdType} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose household type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="Renter">Renter</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Add Family Members <span className="text-red-500">*</span>
                  </h3>

                  {!showMemberSelection ? (
                    <Button
                      onClick={() => setShowMemberSelection(true)}
                      variant="outline"
                      className="w-full h-12 text-base"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Click to Add Members ({selectedMembers.length} selected)
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Select People to Add:</Label>
                        <Button onClick={() => setShowMemberSelection(false)} variant="ghost" size="sm">
                          Done
                        </Button>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search residents by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3">
                        {filteredResidents.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            {searchQuery ? "No residents found matching your search" : "No residents available"}
                          </div>
                        ) : (
                          filteredResidents.map((resident) => {
                            const isSelected = selectedMembers.some((member) => member.ID === resident.ID)
                            return (
                              <div key={resident.ID} className="flex items-center space-x-3">
                                <Checkbox
                                  id={resident.ID}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => toggleMember(resident, checked as boolean)}
                                />
                                <Label htmlFor={resident.ID} className="flex-1 cursor-pointer">
                                  <div>
                                    <div className="font-medium">{resident.Name}</div>
                                    <div className="text-sm text-gray-500">Age: {resident.Age}</div>
                                  </div>
                                </Label>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <Label className="text-sm font-medium">Selected Members:</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[50px]">
                        {selectedMembers.map((member) => {
                          const IconComponent = getRoleIcon(member.Role)
                          return (
                            <div
                              key={member.ID}
                              className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs border border-blue-200"
                            >
                              <span className="font-medium">{member.Name}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                  >
                                    <IconComponent className="h-3 w-3" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto p-0">
                                  <div className="sticky top-0 bg-white border-b p-2 z-10">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                      <Input
                                        placeholder="Search roles..."
                                        className="h-8 text-sm pl-10"
                                        value={roleSearchQuery}
                                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-80 overflow-y-auto">
                                    {filteredRoles.length === 0 ? (
                                      <div className="p-4 text-center text-gray-500 text-sm">
                                        No roles found matching "{roleSearchQuery}"
                                      </div>
                                    ) : (
                                      filteredRoles.map((Role) => {
                                        const RoleIcon = getRoleIcon(Role)
                                        const isSelected = member.Role === Role
                                        const isHeadDisabled =
                                          Role === "Head" && hasHeadOfHousehold() && member.Role !== "Head"

                                        return (
                                          <DropdownMenuItem
                                            key={Role}
                                            onClick={() => !isHeadDisabled && updateMemberRole(member.ID, Role)}
                                            className={`flex items-start gap-3 p-3 cursor-pointer ${isSelected ? "bg-blue-50 text-blue-700" : ""
                                              } ${isHeadDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                            disabled={isHeadDisabled}
                                          >
                                            <RoleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <div className="font-medium text-sm flex items-center gap-2">
                                                {Role}
                                                {isHeadDisabled && (
                                                  <span className="text-xs text-gray-400">(Already assigned)</span>
                                                )}
                                              </div>
                                              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                {roleDefinitions[Role] || "Family member or household resident"}
                                              </div>
                                            </div>
                                          </DropdownMenuItem>
                                        )
                                      })
                                    )}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <button
                                onClick={() => setSelectedMembers(selectedMembers.filter((m) => m.ID !== member.ID))}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                type="button"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Additional Details</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="zone" className="text-sm font-medium">
                        Zone <span className="text-red-500">*</span>
                      </Label>
                      <Select value={zone} onValueChange={setZone} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Zone 1</SelectItem>
                          <SelectItem value="2">Zone 2</SelectItem>
                          <SelectItem value="3">Zone 3</SelectItem>
                          <SelectItem value="4">Zone 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date" className="text-sm font-medium">
                        Date of Residency <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full mt-1 justify-start text-left font-normal",
                              !dateOfResidency && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfResidency ? format(dateOfResidency, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateOfResidency}
                            onSelect={setDateOfResidency}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select value={status} onValueChange={setStatus} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Moved Out">Moved Out</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4">
            <Button
              type="submit"
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Save Household
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
