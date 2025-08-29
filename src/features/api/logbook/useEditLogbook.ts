
import editLogbook, { PatchLogbook } from "@/service/api/logbook/editLogbook";
import { useMutation } from "@tanstack/react-query";

export function useEditLogbook() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchLogbook }) =>
      editLogbook(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
