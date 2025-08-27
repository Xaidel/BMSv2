import postBlotter from "@/service/api/blotter/postBlotter";
import { Blotter } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddEvent() {
  const mutation = useMutation({
    mutationFn: (blotter: Blotter) => postBlotter(blotter)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
