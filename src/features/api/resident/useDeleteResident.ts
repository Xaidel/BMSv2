import deleteResident from "@/service/api/resident/deleteResident";
import { useMutation } from "@tanstack/react-query";

export function useDeleteResident() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteResident(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
