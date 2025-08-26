
import { Income } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchIncome(term: string, data: Income[]) {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((Income) =>
    pattern.test(Income.Type) ||
    pattern.test(Income.Category) ||
    pattern.test(Income.OR.toString()) ||
    pattern.test(Income.ReceivedBy) ||
    pattern.test(Income.ReceivedFrom) ||
    pattern.test(new Date(Income.DateReceived).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }))
  );
}
