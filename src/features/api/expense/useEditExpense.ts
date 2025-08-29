import editExpense, { PatchExpense } from "@/service/api/expense/editExpense";
import { useMutation } from "@tanstack/react-query";

export function useEditExpense() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchExpense }) =>
      editExpense(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
