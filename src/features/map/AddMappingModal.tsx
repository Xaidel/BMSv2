import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building, Building2, Church, Home, Hospital, Landmark, School, Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Feature } from "geojson"
import useAddMapping from "../api/map/useAddMapping"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useHousehold } from "../api/household/useHousehold"

type BuildingType = "residential" | "commercial" | "institutional"

export interface BuildingData {
  residential: { householdNumber: string } | null
  commercial: { businessName: string } | null
  institutional: { institutionType: string; institutionName: string } | null
}

const institutionTypes = [
  { value: "Government / Civic Building", icon: Building2 },
  { value: "Religious", icon: Church },
  { value: "Educational Buildings", icon: School },
  { value: "Healthcare Buildings", icon: Hospital },
  { value: "Emergency / Safety Buildings", icon: Shield },
]

const buildingTypeConfig = {
  residential: {
    color: "bg-green-50 text-green-700 border-green-200",
    darkColor: "dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    icon: Home,
    label: "Residential",
  },
  commercial: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    darkColor: "dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
    icon: Building,
    label: "Commercial",
  },
  institutional: {
    color: "bg-purple-50 text-purple-700 border-purple-200",
    darkColor: "dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    icon: Landmark,
    label: "Institutional",
  },
}

type props = {
  dialogOpen: boolean
  onOpenChange: (open: boolean) => void
  feature: Feature
}

export function AddMappingModal({ dialogOpen, onOpenChange, feature }: props) {
  const [selectedTypes, setSelectedTypes] = useState<BuildingType[]>([])
  const { data: household } = useHousehold()
  const householdData = useMemo(() => {
    if (!household) return []
    return household.households.map(h => {
      const head = h.residents?.find(r => r.role === "Head")
      return {
        householdNumber: h.household_number,
        householdHead: head
          ? `${head.firstname} ${head.lastname}`
          : "No Assigned Head"
      }
    })
  }, [household])
  const [buildingData, setBuildingData] = useState<BuildingData>({
    residential: null,
    commercial: null,
    institutional: null,
  })
  const [currentInputs, setCurrentInputs] = useState({
    residential: "",
    commercial: "",
    institutional: "",
    institutionalName: "",
  })
  const [householdSearch, setHouseholdSearch] = useState("")
  const queryClient = useQueryClient()

  const handleTypeToggle = (type: BuildingType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }
  const addMutation = useAddMapping()
  const handleSubmit = async () => {
    const mappingNames: string[] = []
    const types: string[] = []
    let householdID: number | null = null

    if (buildingData.residential) {
      mappingNames.push(`Household #${buildingData.residential.householdNumber}`)
      types.push("Household")
      householdID = Number.parseInt(buildingData.residential.householdNumber)
    } else {
      mappingNames.push("")
      types.push("")
    }

    if (buildingData.commercial) {
      mappingNames.push(buildingData.commercial.businessName)
      types.push("Commercial")
    } else {
      mappingNames.push("")
      types.push("")
    }

    if (buildingData.institutional) {
      mappingNames.push(buildingData.institutional.institutionName)
      types.push(`Institutional(${buildingData.institutional.institutionType})`)
    } else {
      mappingNames.push("")
      types.push("")
    }

    const formattedData = {
      MappingName: mappingNames.join(","),
      Type: types.join(","),
      HouseholdID: householdID,
      FID: feature.properties.id,
    }

    toast.promise(addMutation.mutateAsync(formattedData), {
      loading: "Adding Building Data please wait...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ['mappings'] })
        return {
          description: "Mapping details successfully added.",
          message: "Mapping added successfully"
        }
      },
      error: () => {
        return {
          message: "Mapping failed",
          description: "Mapping details failed"
        }
      }
    })
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setSelectedTypes([])
    setBuildingData({
      residential: null,
      commercial: null,
      institutional: null,
    })
    setCurrentInputs({
      residential: "",
      commercial: "",
      institutional: "",
      institutionalName: "",
    })
    setHouseholdSearch("")
  }

  useEffect(() => {
    if (!dialogOpen) {
      resetForm()
    }
  }, [dialogOpen])

  const getTotalCount = () => {
    return Object.values(buildingData).filter(Boolean).length
  }

  useEffect(() => {
    if (currentInputs.residential) {
      setBuildingData((prev) => ({ ...prev, residential: { householdNumber: currentInputs.residential } }))
    }
  }, [currentInputs.residential])

  useEffect(() => {
    if (currentInputs.commercial.trim()) {
      setBuildingData((prev) => ({ ...prev, commercial: { businessName: currentInputs.commercial.trim() } }))
    }
  }, [currentInputs.commercial])

  useEffect(() => {
    if (currentInputs.institutional && currentInputs.institutionalName.trim()) {
      setBuildingData((prev) => ({
        ...prev,
        institutional: {
          institutionType: currentInputs.institutional,
          institutionName: currentInputs.institutionalName.trim(),
        },
      }))
    }
  }, [currentInputs.institutional, currentInputs.institutionalName])


  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl text-black font-bold text-balance">Select Building Types</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 min-w-0">
          <div className="space-y-6">
            <h3 className="text-lg text-black font-semibold">Choose Building Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(buildingTypeConfig) as BuildingType[]).map((type) => {
                const config = buildingTypeConfig[type]
                const Icon = config.icon
                const isSelected = selectedTypes.includes(type)

                return (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? `${config.color} ${config.darkColor} border-2` : "border hover:border-gray-300"
                      }`}
                    onClick={() => handleTypeToggle(type)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox checked={isSelected} onChange={() => handleTypeToggle(type)} />
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-base">{config.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {selectedTypes.length > 0 && (
            <div className="space-y-8">
              <Separator />

              {selectedTypes.map((type) => {
                const config = buildingTypeConfig[type]
                const Icon = config.icon

                return (
                  <Card key={type} className={`${config.color} ${config.darkColor} border-2 min-w-0`}>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 flex-shrink-0" />
                        <span className="text-lg">{config.label} Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 min-w-0">
                      {type === "residential" && (
                        <div className="space-y-4">
                          <Label htmlFor="household-select" className="text-base font-medium">
                            Household Number
                          </Label>
                          <Select
                            value={currentInputs.residential}
                            onValueChange={(value) => setCurrentInputs((prev) => ({ ...prev, residential: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select household number" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 border-b">
                                <Input
                                  placeholder="Search household numbers..."
                                  value={householdSearch}
                                  onChange={(e) => setHouseholdSearch(e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              {householdData.length > 0 ? (
                                householdData.map((num) => (
                                  <SelectItem key={num.householdNumber} value={num.householdNumber}>
                                    <div className="p-2 text-xs text-left">
                                      <p>Household #{num.householdNumber}</p>
                                      <p>Head: {num.householdHead}</p>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No household numbers found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {type === "commercial" && (
                        <div className="space-y-4">
                          <Label htmlFor="business-name" className="text-base font-medium">
                            Business Name
                          </Label>
                          <Input
                            id="business-name"
                            placeholder="Enter business name"
                            value={currentInputs.commercial}
                            onChange={(e) => setCurrentInputs((prev) => ({ ...prev, commercial: e.target.value }))}
                            className="h-12 w-full min-w-0"
                          />
                        </div>
                      )}

                      {type === "institutional" && (
                        <div className="space-y-4">
                          <Label htmlFor="institution-select" className="text-base font-medium">
                            Institution Type
                          </Label>
                          <Select
                            value={currentInputs.institutional}
                            onValueChange={(value) => setCurrentInputs((prev) => ({ ...prev, institutional: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select institution type" />
                            </SelectTrigger>
                            <SelectContent>
                              {institutionTypes.map((instType) => {
                                const InstIcon = instType.icon
                                return (
                                  <SelectItem key={instType.value} value={instType.value}>
                                    <div className="flex items-center space-x-2">
                                      <InstIcon className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">{instType.value}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>

                          {currentInputs.institutional && (
                            <div className="space-y-4">
                              <Label htmlFor="institution-name" className="text-base font-medium">
                                Institution Name
                              </Label>
                              <Input
                                id="institution-name"
                                placeholder="Enter institution name"
                                value={currentInputs.institutionalName}
                                onChange={(e) =>
                                  setCurrentInputs((prev) => ({ ...prev, institutionalName: e.target.value }))
                                }
                                className="h-12 w-full min-w-0"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Summary and Actions */}
          {getTotalCount() > 0 && (
            <div className="space-y-6">
              <Separator />
              <div className="flex items-center justify-between pt-4">
                <div className="text-base text-muted-foreground">Total Buildings Selected: {getTotalCount()}</div>
                <div className="flex justify-end">
                  <Button onClick={handleSubmit} size="lg" className="px-8">
                    Submit Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
