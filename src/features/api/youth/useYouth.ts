import getYouth, { YouthResponse } from "@/service/api/youth/getYouth";
import { useQuery } from "@tanstack/react-query";

export function useYouth(id?: number) {
  const query = useQuery({
    queryKey: [`youths`],
    queryFn: (): Promise<YouthResponse> => getYouth(id),
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
