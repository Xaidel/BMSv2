import { api } from "@/service/api";
import { Official } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface OfficialPostResponse {
  official: Official
}

export default async function postOfficial(official: Official): Promise<OfficialPostResponse> {
console.log(official.Name)
  try {
    const res = await fetch(`${api}/officials`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(official)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<OfficialPostResponse>
  } catch (error) {
    throw error
  }

}
