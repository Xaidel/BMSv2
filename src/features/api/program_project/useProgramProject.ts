import getProgramProject, { ProgramProjectResponse } from "@/service/api/program_project/getProgramProject";
import { useQuery } from "@tanstack/react-query";

export function useProgramProject(id?: number) {
  const query = useQuery({
    queryKey: ['program-projects'],
    queryFn: (): Promise<ProgramProjectResponse> => getProgramProject(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
