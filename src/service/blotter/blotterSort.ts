import { Blotter } from "@/types/types";

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
  return [...data].sort((a, b) => a.type_.localeCompare(b.type_, undefined, { sensitivity: "base" }))
}

function sortByID(data: Blotter[]): Blotter[] {
  return [...data].sort((a, b) => a.id - b.id)
}
function sortByDate(data: Blotter[]): Blotter[] {
  return [...data].sort((a, b) => a.incident_date.getTime() - b.incident_date.getTime())
}

function filterActive(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.status === "Active")
}

function filterOnGoing(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.status === "On Going")
}

function filterClosed(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.status === "Closed")
}
function filterTransferred(data: Blotter[]): Blotter[] {
  return [...data].filter((blotter) => blotter.status === "Transferred to Police")
}
