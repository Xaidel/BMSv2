import { Income } from "@/types/types";
import sanitize from "../sanitize";

export default function searchIncome(term: string, data: Income[]) {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((income) =>
    pattern.test(income.type_) ||
    pattern.test(income.category) ||
    pattern.test(income.or_number.toString()) ||
    pattern.test(income.received_from) ||
    pattern.test(income.received_by) ||
    pattern.test(new Date(income.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }))
  );
}
