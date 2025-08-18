import getResident, { ResidentResponse } from "@/service/api/resident/getResident";
import { useQuery } from "@tanstack/react-query";

export function useResident(id?: number) {
  const query = useQuery({
    queryKey: [`residents`],
    queryFn: (): Promise<ResidentResponse> => getResident(id),
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
