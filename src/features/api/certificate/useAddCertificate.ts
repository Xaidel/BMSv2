import postCertificate from "@/service/api/certificate/postCertificate";
import { Certificate } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddCertificate() {
  const mutation = useMutation({
    mutationFn: (certificate: Certificate) => postCertificate(certificate)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
