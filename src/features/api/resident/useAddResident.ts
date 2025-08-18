import postResident from "@/service/api/resident/postResident";
import { Resident } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddResident() {
  const mutation = useMutation({
    mutationFn: (resident: Resident) => postResident(resident)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
