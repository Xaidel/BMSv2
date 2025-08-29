

import deleteLogbook from "@/service/api/logbook/deleteLogbook"
import { useMutation } from "@tanstack/react-query"

export function useDeleteLogbook() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteLogbook(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
