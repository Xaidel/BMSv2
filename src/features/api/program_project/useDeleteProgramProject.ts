import deleteProgramProject from "@/service/api/program_project/deleteProgramProject"
import { useMutation } from "@tanstack/react-query"

export function useDeleteProgramProject() {
  const mutation = useMutation({
    mutationFn: (ids: number[]) => deleteProgramProject(ids)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
