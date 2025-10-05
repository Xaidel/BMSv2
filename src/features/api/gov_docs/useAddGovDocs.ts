import postGovDocs from "@/service/api/gov_docs/postGovDocs";
import { GovDoc } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddGovDoc() {
  const mutation = useMutation({
    mutationFn: (govDoc: GovDoc) => postGovDocs(govDoc)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
