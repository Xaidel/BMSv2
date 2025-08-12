import postEvent from "@/service/api/event/postEvent";
import { Event } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddEvent() {
  const mutation = useMutation({
    mutationFn: (event: Event) => postEvent(event)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
