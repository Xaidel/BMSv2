import { Logbook } from "@/types/types";
import sanitize from "../sanitize";

export default function searchLogbook(term: string, data: Logbook[]): Logbook[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((entry: Logbook) =>
    pattern.test(entry.official_name.toString()) ||
    pattern.test(entry.remarks ?? "") ||
    pattern.test(entry.status ?? "") ||
    pattern.test(entry.total_hours !== undefined ? entry.total_hours.toString() : "") ||
    pattern.test(entry.date.toString())
  );
}
