
import deleteOfficial from "@/service/api/official/deleteOfficial"
import { useMutation } from "@tanstack/react-query"

export function useDeleteOfficial() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteOfficial(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
