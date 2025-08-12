import getEvent, { EventResponse } from "@/service/api/event/getEvent";
import { useQuery } from "@tanstack/react-query";

export function useEvent(id?: number) {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: (): Promise<EventResponse> => getEvent(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
