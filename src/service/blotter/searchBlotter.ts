import { Blotter } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchBlotter(term: string, data: Blotter[]): Blotter[] {
  const sanitzedQuery = sanitize(term)
  const pattern = new RegExp(sanitzedQuery, "i")

  return data.filter(blotter =>
    pattern.test(blotter.ID.toString()) ||
    pattern.test(blotter.Involved) ||
    pattern.test(blotter.Type) ||
    pattern.test(blotter.Location) ||
    pattern.test(blotter.ReportedBy) ||
    pattern.test(blotter.Type)
    
  )
}
