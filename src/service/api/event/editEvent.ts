import { api } from "@/service/api"
export type PatchEvent = Partial<{
  Name: string
  Type: string
  Date: string
  Venue: string
  Audience: string
  Notes: string
  Status: "Upcoming" | "Ongoing" | "Finished" | "Cancelled"
}>
export default async function editEvent(event_id: number, updated: PatchEvent) {
  try {
    const res = await fetch(`${api}/events/${event_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchEvent
  } catch (error) {
    throw error
  }
}
