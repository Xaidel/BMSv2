import { Event } from "@/types/apitypes"

export function sort(data: Event[], term: string): Event[] {
  switch (term) {
    case "Date ASC":
      return sortDateAsc(data)
    case "Date DESC":
      return sortDateDesc(data)
    case "Upcoming":
      return filterByUpcoming(data)
    case "Finished":
      return filterByFinished(data)
    case "Cancelled":
      return filterByCancelled(data)
    case "Ongoing":
      return filterByOngoing(data)
    default:
      return data
  }
}

function sortDateAsc(data: Event[]): Event[] {
  return [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
}
function sortDateDesc(data: Event[]): Event[] {
  return [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
}
function filterByUpcoming(data: Event[]): Event[] {
  return data.filter((event) => event.Status === "Upcoming")
}
function filterByFinished(data: Event[]): Event[] {
  return data.filter((event) => event.Status === "Finished")
}
function filterByCancelled(data: Event[]): Event[] {
  return data.filter((event) => event.Status === "Cancelled")
}
function filterByOngoing(data: Event[]): Event[] {
  return data.filter((event) => event.Status === "Ongoing")
}
