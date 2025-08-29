import { Logbook } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchLogbook(term: string, data: Logbook[]): Logbook[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((entry: Logbook) =>
    pattern.test(entry.Name.toString()) ||
    pattern.test(entry.Remarks ?? "") ||
    pattern.test(entry.Status ?? "") ||
    pattern.test(entry.TotalHours !== undefined ? entry.TotalHours.toString() : "") ||
    pattern.test(entry.Date.toString())
  );
}
