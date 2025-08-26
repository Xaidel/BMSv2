
import editIncome, { PatchIncome } from "@/service/api/income/editIncome";
import { useMutation } from "@tanstack/react-query";

export function useEditIncome() {
  const mutation = useMutation({
    mutationFn: ({ income_id, updated }: { income_id: number, updated: PatchIncome }) =>
      editIncome(income_id, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
