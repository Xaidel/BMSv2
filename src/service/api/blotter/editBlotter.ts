import { api } from "@/service/api"
export type PatchBlotter = Partial<{
  Name: string
  Type: string
  Date: string
  Venue: string
  Audience: string
  Notes: string
  Status: "Upcoming" | "Ongoing" | "Finished" | "Cancelled"
}>
export default async function editBlotter(ID: number, updated: PatchBlotter) {
  try {
    const res = await fetch(`${api}/blotters/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchBlotter
  } catch (error) {
    throw error
  }
}
