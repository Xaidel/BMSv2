import { Event } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchEvent(term: string, data: Event[]): Event[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((event: Event) =>
    pattern.test(event.Name) ||
    pattern.test(event.Type) ||
    pattern.test(event.Venue) ||
    pattern.test(event.Audience) ||
    pattern.test(event.Status)
  );
}
