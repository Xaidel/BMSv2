import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Blotter } from "@/types/apitypes";

export interface BlotterResponse {
  blotters: Blotter[]
}

export default async function getBlotter(id?: number): Promise<BlotterResponse> {
  try {
    const url = id ? `${api}/blotters/${id}` : `${api}/blotters`
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
    return res.json() as Promise<BlotterResponse>
  } catch (error) {
    throw error
  }
} 
