import { Resident } from "@/types/types";
import sanitize from "../sanitize";

export default function searchResident(term: string, data: Resident[]) {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((resident) => {
    const searchableFields = [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.gender,
      resident.status,
      resident.zone,
      resident.civil_status,
    ];

    const fullName = `${resident.first_name} ${resident.middle_name ?? ""} ${resident.last_name}`.trim();
console.log(searchableFields.find(field => field && pattern.test(field)) || pattern.test(fullName))
    return searchableFields.some(field => field && pattern.test(field)) || pattern.test(fullName);
  });
}