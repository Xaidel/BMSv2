import { Event } from "@/types/types";

export function sort(data: Event[], term: string): Event[] {
  switch (term) {
    case "Date ASC":
      return sortDateAsc(data)
    case "Date DESC":
      return sortDateDesc(data)
    case "Venue":
      return sortByVenue(data)
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
  return [...data].sort((a, b) => a.date.getTime() - b.date.getTime())
}
function sortDateDesc(data: Event[]): Event[] {
  return [...data].sort((a, b) => b.date.getTime() - a.date.getTime())
}
function sortByVenue(data: Event[]): Event[] {
  return [...data].sort((a, b) => a.venue.localeCompare(b.venue, undefined, { sensitivity: 'base' }))
}
function filterByUpcoming(data: Event[]): Event[] {
  return data.filter((event) => event.status === "Upcoming")
}
function filterByFinished(data: Event[]): Event[] {
  return data.filter((event) => event.status === "Finished")
}
function filterByCancelled(data: Event[]): Event[] {
  return data.filter((event) => event.status === "Cancelled")
}
function filterByOngoing(data: Event[]): Event[] {
  return data.filter((event) => event.status === "Ongoing")
}
