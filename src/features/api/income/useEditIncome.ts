import editIncome, { PatchIncome } from "@/service/api/income/editIncome";
import { useMutation } from "@tanstack/react-query";

export function useEditIncome() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchIncome }) =>
      editIncome(ID, updated)
  })
  return {
    ...mutation,
    isPendin: mutation.isPending
  }
}
