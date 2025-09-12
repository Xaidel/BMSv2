import postMapping from "@/service/api/map/postMapping";
import { useMutation } from "@tanstack/react-query";

export default function useAddMapping() {
  const mutation = useMutation({
    mutationFn: (mapping: {
      MappingName: string,
      Type: string,
      HouseholdID: number | null,
      FID: number | null,
    }) => postMapping(mapping)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
