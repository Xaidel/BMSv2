
import editYouth from "@/service/api/youth/editYouth";
import { Youth } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useEditYouth() {
  const mutation = useMutation({
    mutationFn: ({ youth_id, updated }: { youth_id: number, updated: Partial<Youth> }) =>
      editYouth(youth_id, updated)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
