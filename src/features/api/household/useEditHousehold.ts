import editHousehold, { PatchHousehold } from "@/service/api/household/editHousehold";
import { useMutation } from "@tanstack/react-query";

export function useEditHousehold() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number; updated: PatchHousehold }) => {
      if (!ID) {
        throw new Error("Household ID is required for update")
      }
      return editHousehold(ID, updated)
    }
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
