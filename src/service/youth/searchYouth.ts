import { Youth } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchYouth(term: string, data: Youth[]) {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((youth) => {
    const searchableFields = [
      youth.Firstname,
      youth.Middlename,
      youth.Lastname,
      youth.Gender,
      youth.Zone,
      youth.CivilStatus,
      youth.Suffix,
      youth.Address,
      youth.EmailAddress,
      youth.ContactNumber,
      youth.EducationalBackground,
      youth.WorkStatus
    ];

    const fullName = `${youth.Firstname ?? ""} ${youth.Middlename ?? ""} ${youth.Lastname ?? ""}`.trim();
    return searchableFields.some(field => field !== undefined && pattern.test(String(field))) || pattern.test(String(fullName));
  });
}
