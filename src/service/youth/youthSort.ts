import { Youth } from "@/types/apitypes"

export function youthSort(data: Youth[], term: string): Youth[] {
  switch (term) {
    case "Alphabetical":
      return sortAlphabetical(data)
    case "In School Youth":
      return filterInSchoolYouth(data)
    case "Out of School Youth":
      return filterOutOfSchoolYouth(data)
    case "Working Youth":
      return filterWorkingYouth(data)
    case "Youth w/ Specific Needs":
      return filterYouthWithSpecificNeeds(data)
    case "SK Voters":
      return filterIsSKVoter(data)
    case "Child Youth (15-17 yrs old)":
    case "Core Youth (18-24 yrs old)":
    case "Young Adult (25-30 yrs old)":
      return filterByAgeGroup(data, term)
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
  return data.filter((youth) => youth.OutOfSchoolYouth === true)
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

function filterByAgeGroup(data: Youth[], term: string): Youth[] {
  const currentYear = new Date().getFullYear();

  return data.filter((youth) => {
    if (!youth.Birthday) return false;
    const age = currentYear - new Date(youth.Birthday).getFullYear();

    switch (term) {
      case "Child Youth (15-17 yrs old)":
        return age >= 15 && age <= 17;
      case "Core Youth (18-24 yrs old)":
        return age >= 18 && age <= 24;
      case "Young Adult (25-30 yrs old)":
        return age >= 25 && age <= 30;
      default:
        return false;
    }
  });
}
