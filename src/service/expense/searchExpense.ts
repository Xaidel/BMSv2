import { Expense } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchExpense(term: string, data: Expense[]): Expense[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter(expense =>
    pattern.test(expense.Type) ||
    pattern.test(expense.OR.toString()) ||
    pattern.test(expense.PaidBy) ||
    pattern.test(expense.PaidTo) ||
    pattern.test(expense.Category)
  );
}
