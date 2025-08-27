import deleteBlotter from "@/service/api/blotter/deleteBlotter"
import { useMutation } from "@tanstack/react-query"

export function useDeleteBlotter() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteBlotter(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
