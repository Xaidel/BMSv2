import editEvent, { PatchEvent } from "@/service/api/event/editEvent";
import { useMutation } from "@tanstack/react-query";

export function useEditEvent() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchEvent }) =>
      editEvent(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
