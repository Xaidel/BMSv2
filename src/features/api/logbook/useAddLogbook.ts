
import postLogbook from "@/service/api/logbook/postLogbook";
import { Logbook } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddLogbook() {
  const mutation = useMutation({
    mutationFn: (logbook: Logbook) => postLogbook(logbook)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
