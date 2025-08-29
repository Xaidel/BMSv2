
import postOfficial from "@/service/api/official/postOfficial";
import { Official } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddOfficial() {
  const mutation = useMutation({
    mutationFn: (official: Official) => postOfficial(official)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
