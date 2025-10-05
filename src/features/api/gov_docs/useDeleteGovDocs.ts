import deleteGovDocs from "@/service/api/gov_docs/deleteGovDocs"
import { useMutation } from "@tanstack/react-query"

export function useDeleteGovDocs() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteGovDocs(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
