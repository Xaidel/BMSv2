import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { ProgramProject } from "@/types/apitypes";

export interface ProgramProjectResponse {
  program_projects: ProgramProject[]
}

export default async function getProgramProject(ID?: number): Promise<ProgramProjectResponse> {
  try {
    const url = ID ? `${api}/program-projects/${ID}` : `${api}/program-projects`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<ProgramProjectResponse>
  } catch (error) {
    throw error
  }
} 
