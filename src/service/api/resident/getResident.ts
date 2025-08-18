import { api } from "@/service/api";
import { Resident } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface ResidentResponse {
  residents: Resident[]
}

export default async function getResident(id?: number): Promise<ResidentResponse> {
  try {
    const url = id ? `${api}/residents/${id}` : `${api}/residents`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<ResidentResponse>
  } catch (error) {
    throw error
  }
}
