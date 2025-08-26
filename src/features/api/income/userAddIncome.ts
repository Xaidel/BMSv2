
import postIncome from "@/service/api/income/postIncome";
import { Income } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddIncome() {
  const mutation = useMutation({
    mutationFn: (income: Income) => postIncome(income)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
