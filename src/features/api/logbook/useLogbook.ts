
import getLogbook, { LogbookResponse } from "@/service/api/logbook/getLogbook";
import { useQuery } from "@tanstack/react-query";

export function useLogbook(id?: number) {
  const query = useQuery({
    queryKey: ['logbooks'],
    queryFn: (): Promise<LogbookResponse> => getLogbook(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
