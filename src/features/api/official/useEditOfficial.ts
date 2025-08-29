
import editOfficial, { PatchOfficial } from "@/service/api/official/editOfficial";
import { useMutation } from "@tanstack/react-query";

export function useEditOfficial() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchOfficial }) =>
      editOfficial(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
