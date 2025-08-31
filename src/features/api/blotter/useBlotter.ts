
import getBlotter, { BlotterResponse } from "@/service/api/blotter/getBlotter";
import { useQuery } from "@tanstack/react-query";


export function useBlotter(id?: number) {
  const query = useQuery({
    queryKey: ['blotters'],
    queryFn: (): Promise<BlotterResponse> => getBlotter(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
