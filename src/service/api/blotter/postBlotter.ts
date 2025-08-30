import { api } from "@/service/api";
import { Blotter } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface BlotterPostResponse {
  blotters: Blotter []
}

export default async function postBlotter(blotter: Blotter): Promise<BlotterPostResponse> {

  try {
    const res = await fetch(`${api}/blotters`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(blotter)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<BlotterPostResponse>
  } catch (error) {
    throw error
  }

}
