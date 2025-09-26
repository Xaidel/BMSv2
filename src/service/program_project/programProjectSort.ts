import { ProgramProject } from "@/types/apitypes"

export function sort(data: ProgramProject[], term: string): ProgramProject[] {
  switch (term) {
    case "Start Date ASC":
      return sortStartDateAsc(data)
    case "Start Date DESC":
      return sortStartDateDesc(data)
    case "End Date ASC":
      return sortEndDateAsc(data)
    case "End Date DESC":
      return sortEndDateDesc(data)
    case "Ongoing":
      return filterByOngoing(data)
    case "Completed":
      return filterByCompleted(data)
    case "Planned":
      return filterByPlanned(data)
    case "Cancelled":
      return filterByCancelled(data)
    default:
      return data
  }
}

function sortStartDateAsc(data: ProgramProject[]): ProgramProject[] {
  return [...data].sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
}
function sortStartDateDesc(data: ProgramProject[]): ProgramProject[] {
  return [...data].sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime())
}
function sortEndDateAsc(data: ProgramProject[]): ProgramProject[] {
  return [...data].sort((a, b) => new Date(a.EndDate).getTime() - new Date(b.EndDate).getTime())
}
function sortEndDateDesc(data: ProgramProject[]): ProgramProject[] {
  return [...data].sort((a, b) => new Date(b.EndDate).getTime() - new Date(a.EndDate).getTime())
}
function filterByOngoing(data: ProgramProject[]): ProgramProject[] {
  return data.filter((project) => project.Status === "Ongoing")
}
function filterByCompleted(data: ProgramProject[]): ProgramProject[] {
  return data.filter((project) => project.Status === "Completed")
}
function filterByPlanned(data: ProgramProject[]): ProgramProject[] {
  return data.filter((project) => project.Status === "Planned")
}
function filterByCancelled(data: ProgramProject[]): ProgramProject[] {
  return data.filter((project) => project.Status === "Cancelled")
}
