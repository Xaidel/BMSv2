import deleteHousehold from "@/service/api/household/deleteHousehold";
import { useMutation } from "@tanstack/react-query";

export function useDeleteHousehold() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteHousehold(ids)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
