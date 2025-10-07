import deleteYouth from "@/service/api/youth/deleteYouth";
import { useMutation } from "@tanstack/react-query";

export function useDeleteYouth() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteYouth(ids),
  });

  return {
    ...mutation,
    isPending: mutation.isPending,
  };
}
