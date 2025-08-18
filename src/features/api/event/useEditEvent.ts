import editEvent, { PatchEvent } from "@/service/api/event/editEvent";
import { useMutation } from "@tanstack/react-query";

export function useEditEvent() {
  const mutation = useMutation({
    mutationFn: ({ event_id, updated }: { event_id: number, updated: PatchEvent }) =>
      editEvent(event_id, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
