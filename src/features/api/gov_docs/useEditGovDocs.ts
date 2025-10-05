import editGovDocs, { PatchGovDoc } from "@/service/api/gov_docs/editGovDocs";
import { useMutation } from "@tanstack/react-query";

export function useEditGovDocs() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number; updated: PatchGovDoc }) =>
      editGovDocs(ID, updated)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
