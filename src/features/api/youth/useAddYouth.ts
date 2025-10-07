
import postYouth from "@/service/api/youth/postYouth";
import { Youth } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddYouth() {
  const mutation = useMutation({
    mutationFn: (youth: Youth) => postYouth(youth),
  });
  return {
    ...mutation,
    isPending: mutation.isPending,
  };
}
