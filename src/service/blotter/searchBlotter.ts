import { Blotter } from "@/types/types";
import sanitize from "../sanitize";

export default function searchBlotter(term: string, data: Blotter[]): Blotter[] {
  const sanitzedQuery = sanitize(term)
  const pattern = new RegExp(sanitzedQuery, "i")

  return data.filter(blotter =>
    pattern.test(blotter.id.toString()) ||
    pattern.test(blotter.involved) ||
    pattern.test(blotter.type_) ||
    pattern.test(blotter.location) ||
    pattern.test(blotter.reported_by)
  )
}
