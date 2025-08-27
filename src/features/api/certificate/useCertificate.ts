import getCertificate, { CertificateResponse } from "@/service/api/certificate/getCertificate";
import { useQuery } from "@tanstack/react-query";

export function useCertificate(id?: number) {
  const query = useQuery({
    queryKey: ['certificates'],
    queryFn: (): Promise<CertificateResponse> => getCertificate(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
