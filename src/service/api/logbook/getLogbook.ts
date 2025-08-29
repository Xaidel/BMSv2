import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Logbook } from "@/types/apitypes";

export interface LogbookResponse {
  logbooks: Logbook[]
}

export default async function getLogbook(id?: number): Promise<LogbookResponse> {
  try {
    const url = id ? `${api}/logbooks/${id}` : `${api}/logbooks`
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
    return res.json() as Promise<LogbookResponse>
  } catch (error) {
    throw error
  }
} 
