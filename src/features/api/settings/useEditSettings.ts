
import editSettings, { PatchSettings } from "@/service/api/settings/editSettings";
import { useMutation } from "@tanstack/react-query";

export function useEditSettings() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchSettings }) =>
      editSettings(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
