import { api } from "@/service/api"
export type PatchIncome = Partial<{
  Name: string
  Type: string
  Date: string
  Venue: string
  Audience: string
  Notes: string
  Status: "Upcoming" | "Ongoing" | "Finished" | "Cancelled"
}>
export default async function editIncome(income_id: number, updated: PatchIncome) {
  try {
    const res = await fetch(`${api}/incomes/${income_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchIncome
  } catch (error) {
    throw error
  }
}
