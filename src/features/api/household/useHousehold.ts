import getHousehold, { HouseholdResponse } from "@/service/api/household/getHousehold";
import { useQuery } from "@tanstack/react-query";

export function useHousehold() {
  const query = useQuery({
    queryKey: ['household'],
    queryFn: (): Promise<HouseholdResponse> => getHousehold()
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
