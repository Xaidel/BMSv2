import editResident from "@/service/api/resident/editResident";
import { Resident } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useEditResident() {
  const mutation = useMutation({
    mutationFn: ({ resident_id, updated }: { resident_id: number, updated: Partial<Resident> }) =>
      editResident(resident_id, updated)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
