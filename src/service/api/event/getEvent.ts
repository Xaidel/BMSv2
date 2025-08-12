import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Event } from "@/types/apitypes";

export interface EventResponse {
  events: Event[]
}

export default async function getEvent(id?: number): Promise<EventResponse> {
  try {
    const url = id ? `${api}/events/${id}` : `${api}/events`
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
    return res.json() as Promise<EventResponse>
  } catch (error) {
    throw error
  }
} 
