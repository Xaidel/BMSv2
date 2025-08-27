

import deleteSettings from "@/service/api/settings/deleteSettings"
import { useMutation } from "@tanstack/react-query"

export function useDeleteSettings() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteSettings(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
