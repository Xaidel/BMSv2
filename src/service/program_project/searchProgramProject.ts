import { ProgramProject } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchProgramProject(term: string, data: ProgramProject[]): ProgramProject[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((programProject: ProgramProject) =>
    pattern.test(programProject.Name) ||
    pattern.test(programProject.Type) ||
    pattern.test(programProject.Location) ||
    pattern.test(programProject.ProjectManager) ||
    pattern.test(programProject.Beneficiaries) ||
    pattern.test(programProject.Status) ||
    pattern.test(programProject.SourceOfFunds)
  );
}
