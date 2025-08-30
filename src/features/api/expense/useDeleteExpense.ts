
import deleteExpense from "@/service/api/expense/deleteExpense"
import { useMutation } from "@tanstack/react-query"

export function useDeleteExpense() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteExpense(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
