import { api } from "@/service/api";
import { Event } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface EventPostResponse {
  event: Event
}

export default async function postEvent(event: Event): Promise<EventPostResponse> {

  try {
    const res = await fetch(`${api}/events`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<EventPostResponse>
  } catch (error) {
    throw error
  }

}
