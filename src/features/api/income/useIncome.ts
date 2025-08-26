
import getIncome, { IncomeResponse } from "@/service/api/income/getIncome";
import { useQuery } from "@tanstack/react-query";

export function useIncome(id?: number) {
  const query = useQuery({
    queryKey: ['incomes'],
    queryFn: (): Promise<IncomeResponse> => getIncome(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
