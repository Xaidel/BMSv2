import { api } from "@/service/api";
import { ProgramProject } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface ProgramProjectPostResponse {
  programProject: ProgramProject
}

export default async function postProgramProject(programProject: ProgramProject): Promise<ProgramProjectPostResponse> {

  try {
    const res = await fetch(`${api}/program-projects`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(programProject)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<ProgramProjectPostResponse>
  } catch (error) {
    throw error
  }

}
