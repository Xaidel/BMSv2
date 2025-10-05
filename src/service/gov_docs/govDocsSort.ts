import { GovDoc } from "@/types/apitypes"

export function sort(data: GovDoc[], term: string): GovDoc[] {
  switch (term) {
    case "Date Issued ASC":
      return sortDateIssuedAsc(data)
    case "Date Issued DESC":
      return sortDateIssuedDesc(data)
    case "Executive Orders":
      return filterByExecutiveOrders(data)
    case "Resolutions":
      return filterByResolutions(data)
    case "Ordinances":
      return filterByOrdinances(data)
    default:
      return data
  }
}

function sortDateIssuedAsc(data: GovDoc[]): GovDoc[] {
  return [...data].sort((a, b) => new Date(a.DateIssued).getTime() - new Date(b.DateIssued).getTime())
}
function sortDateIssuedDesc(data: GovDoc[]): GovDoc[] {
  return [...data].sort((a, b) => new Date(b.DateIssued).getTime() - new Date(a.DateIssued).getTime())
}
function filterByExecutiveOrders(data: GovDoc[]): GovDoc[] {
  return data.filter((doc) => doc.Type === "Executive Order")
}
function filterByResolutions(data: GovDoc[]): GovDoc[] {
  return data.filter((doc) => doc.Type === "Resolution")
}
function filterByOrdinances(data: GovDoc[]): GovDoc[] {
  return data.filter((doc) => doc.Type === "Ordinance")
}
