import { Expense } from "@/types/types";
import sanitize from "../sanitize";

export default function searchExpense(term: string, data: Expense[]): Expense[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter(expense =>
    pattern.test(expense.type_) ||
    pattern.test(expense.or_number.toString()) ||
    pattern.test(expense.paid_to) ||
    pattern.test(expense.paid_by)
  );
}
