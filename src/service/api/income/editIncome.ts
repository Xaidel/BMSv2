import { api } from "@/service/api"
export type PatchIncome = Partial<{
  ID: number
  Category: string
  Type: string
  Amount: number
  OR: string
  ReceivedFrom: string
  ReceivedBy: string
  DateReceived: Date
}>
export default async function editIncome(ID: number, updated: PatchIncome) {
  try {
    const res = await fetch(`${api}/incomes/${ID}`, {
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
