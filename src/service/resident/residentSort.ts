import { Resident } from "@/types/apitypes"

export function sort(data: Resident[], term: string): Resident[] {
  switch (term) {
    case "Alphabetical":
      return sortAlphabetical(data)
    case "Moved Out":
      return filterMovedOut(data)
    case "Active":
      return filterActive(data)
    case "Dead":
      return filterDead(data)
    case "Missing":
      return filterMissing(data)
    default:
      return data
  }
}

function sortAlphabetical(data: Resident[]): Resident[] {
  return [...data].sort((a, b) => a.Lastname.localeCompare(b.Lastname, undefined, { sensitivity: "base" }))
}
function filterMovedOut(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.Status === "Moved Out")
}
function filterActive(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.Status === "Active")
}
function filterDead(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.Status === "Dead")
}
function filterMissing(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.Status === "Missing")
}


