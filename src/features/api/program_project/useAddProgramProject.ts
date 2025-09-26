import postProgramProject from "@/service/api/program_project/postProgramProject";
import { ProgramProject } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddProgramProject() {
  const mutation = useMutation({
    mutationFn: (programProject: ProgramProject) => postProgramProject(programProject)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
