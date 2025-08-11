import { Resident } from "@/types/types";

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
  return [...data].sort((a, b) => a.last_name.localeCompare(b.last_name, undefined, { sensitivity: "base" }))
}
function filterMovedOut(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.status === "Moved Out")
}
function filterActive(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.status === "Active")
}
function filterDead(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.status === "Dead")
}
function filterMissing(data: Resident[]): Resident[] {
  return data.filter((resident) => resident.status === "Missing")
}


