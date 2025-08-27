import { api } from "@/service/api";
import { Settings } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface SettingsPostResponse {
  settings: Settings
}

export default async function postIncome(settings: Settings): Promise<SettingsPostResponse> {
  try {
    const res = await fetch(`${api}/settings`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(settings)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<SettingsPostResponse>
  } catch (error) {
    throw error
  }

}
