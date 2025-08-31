import editSettings, { PatchSettings } from "@/service/api/settings/editSettings";
import { useMutation } from "@tanstack/react-query";


export function useEditSettings() {
  const mutation = useMutation<Partial<PatchSettings>, Error, { ID: number; updated: PatchSettings }>({
    mutationFn: ({ ID, updated }) => editSettings(ID, updated)
  });
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
