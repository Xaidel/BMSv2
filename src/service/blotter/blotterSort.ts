import { Blotter } from "@/types/apitypes";

export default function sort(data: Blotter[], term: string): Blotter[] {
  switch (term) {
    case "Alphabetical":
      return sortAlphabetical(data)
    case "ID":
      return sortByID(data)
    case "Active":
      return filterActive(data)
    case "On Going":
      return filterOnGoing(data)
    case "Closed":
      return filterClosed(data)
    case "Transferred to Police":
      return filterTransferred(data)
    case "Date Incident":
      return sortByDate(data)
    default:
      return data
  }
}

function sortAlphabetical(data: Blotter[]): Blotter[] {
  return [...data].sort((a, b) => a.Type.localeCompare(b.Type, undefined, { sensitivity: "base" }))
}

function sortByID(data: Blotter[]): Blotter[] {
  return [...data].sort((a, b) => (a.ID! - b.ID!))
}
function sortByDate(data: Blotter[]): Blotter[] {
  return [...data].sort((a, b) => a.IncidentDate.getTime() - b.IncidentDate.getTime())
}

function filterActive(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.Status === "Active")
}

function filterOnGoing(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.Status === "On Going")
}

function filterClosed(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.Status === "Closed")
}
function filterTransferred(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.Status === "Transferred to Police")
}
