import getGovDocs, { GovDocsResponse } from "@/service/api/gov_docs/getGovDocs";
import { useQuery } from "@tanstack/react-query";

export function useGovDocs(id?: number) {
  const query = useQuery({
    queryKey: ['govdocs'],
    queryFn: (): Promise<GovDocsResponse> => getGovDocs(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    isError: query.isError
  }
}
