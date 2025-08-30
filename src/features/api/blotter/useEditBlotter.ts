import editBlotter, { PatchBlotter } from "@/service/api/blotter/editBlotter";
import { useMutation } from "@tanstack/react-query";

export function useEditBlotter() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchBlotter }) =>
      editBlotter(ID, updated)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
