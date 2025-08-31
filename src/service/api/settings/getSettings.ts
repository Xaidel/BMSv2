import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Settings } from "@/types/apitypes";

export interface SettingsResponse {
  setting: Settings
}

export default async function getSettings(id?: number): Promise<SettingsResponse> {
  try {
    const url = id ? `${api}/settings/${id}` : `${api}/settings`
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
    return res.json() as Promise<SettingsResponse>
  } catch (error) {
    throw error
  }
} 
