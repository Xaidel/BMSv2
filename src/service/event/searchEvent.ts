import { Event } from "@/types/types";
import sanitize from "../sanitize";

export default function searchEvent(term: string, data: Event[]): Event[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((event: Event) =>
    pattern.test(event.name) ||
    pattern.test(event.type_) ||
    pattern.test(event.venue) ||
    pattern.test(event.attendee) ||
    pattern.test(event.status)
  );
}
