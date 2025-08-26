
import deleteIncome from "@/service/api/income/deleteIncome"
import { useMutation } from "@tanstack/react-query"

export function useDeleteIncome() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteIncome(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
