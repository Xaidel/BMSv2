import editProgramProject, { PatchProgramProject } from "@/service/api/program_project/editProgramProject";
import { useMutation } from "@tanstack/react-query";

export function useEditProgramProject() {
  const mutation = useMutation({
    mutationFn: ({ ID, updated }: { ID: number, updated: PatchProgramProject }) =>
      editProgramProject(ID, updated)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
