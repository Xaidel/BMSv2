import deleteEvent from "@/service/api/event/deleteEvent"
import { useMutation } from "@tanstack/react-query"

export function useDeleteEvent() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteEvent(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
