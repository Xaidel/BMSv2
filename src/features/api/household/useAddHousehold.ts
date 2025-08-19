import postHousehold, { HouseholdProps } from "@/service/api/household/postHousehold";
import { useMutation } from "@tanstack/react-query";

export function useAddHousehold() {
  const mutation = useMutation({
    mutationFn: (data: HouseholdProps) => postHousehold(data)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
