import editCertificate, { PatchCertificate } from "@/service/api/certificate/editCertificate";
import { useMutation } from "@tanstack/react-query";

export function useEditCertificate() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchCertificate }) =>
      editCertificate(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
