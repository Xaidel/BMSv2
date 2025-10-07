import { Youth } from "@/types/apitypes"

export function youthSort(data: Youth[], term: string): Youth[] {
  switch (term) {
    case "Alphabetical":
      return sortAlphabetical(data)
    case "InSchoolYouth":
      return filterInSchoolYouth(data)
    case "OutOfSchoolYouth":
      return filterOutOfSchoolYouth(data)
    case "WorkingYouth":
      return filterWorkingYouth(data)
    case "YouthWithSpecificNeeds":
      return filterYouthWithSpecificNeeds(data)
    case "IsSKVoter":
      return filterIsSKVoter(data)
    default:
      return data
  }
}

function sortAlphabetical(data: Youth[]): Youth[] {
  return [...data].sort((a, b) => a.Lastname.localeCompare(b.Lastname, undefined, { sensitivity: "base" }))
}

function filterInSchoolYouth(data: Youth[]): Youth[] {
  return data.filter((youth) => youth.InSchoolYouth === true)
}

function filterOutOfSchoolYouth(data: Youth[]): Youth[] {
  return data.filter((youth) => youth.InSchoolYouth === false)
}

function filterWorkingYouth(data: Youth[]): Youth[] {
  return data.filter((youth) => youth.WorkingYouth === true)
}

function filterYouthWithSpecificNeeds(data: Youth[]): Youth[] {
  return data.filter((youth) => youth.YouthWithSpecificNeeds === true)
}

function filterIsSKVoter(data: Youth[]): Youth[] {
  return data.filter((youth) => youth.IsSKVoter === true)
}
