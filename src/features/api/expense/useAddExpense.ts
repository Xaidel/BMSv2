

import postExpense from "@/service/api/expense/postExpense";
import { Expense } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddExpense() {
  const mutation = useMutation({
    mutationFn: (expense: Expense) => postExpense(expense)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
