
import getExpense, { ExpenseResponse } from "@/service/api/expense/getExpense";
import { useQuery } from "@tanstack/react-query";


export function useExpense(id?: number) {
  const query = useQuery({
    queryKey: ['expenses'],
    queryFn: (): Promise<ExpenseResponse> => getExpense(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
