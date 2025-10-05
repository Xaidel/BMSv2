import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { GovDoc } from "@/types/apitypes";

export interface GovDocsResponse {
  records: GovDoc[]
}

export default async function getGovDocs(ID?: number): Promise<GovDocsResponse> {
  try {
    const url = ID ? `${api}/gov-docs/${ID}` : `${api}/gov-docs`
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
    return res.json() as Promise<GovDocsResponse>
  } catch (error) {
    throw error
  }
} 
