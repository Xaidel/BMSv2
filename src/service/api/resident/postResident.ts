import { api } from "@/service/api";
import { Resident } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface ResidentPostResponse {
  resident: Resident
}

export default async function postResident(resident: Resident): Promise<ResidentPostResponse> {
  try {
    const res = await fetch(`${api}/residents`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resident)
    });
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<ResidentPostResponse>
  } catch (error) {
    throw error
  }
}
