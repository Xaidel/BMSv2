import deleteCertificate from "@/service/api/certificate/deleteCertificate"
import { useMutation } from "@tanstack/react-query"

export function useDeleteCertificate() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteCertificate(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
