import deleteMapping from "@/service/api/map/deleteMapping";
import { useMutation } from "@tanstack/react-query";

export default function useDeleteMapping() {
  const mutation = useMutation({
    mutationFn: (id: number) => deleteMapping(id)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
