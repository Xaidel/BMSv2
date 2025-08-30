import { api } from "@/service/api"
export type PatchExpense = Partial<{
  ID: number
  Category: string
  Type: string
  Amount: number
  OR: string
  PaidBy: string
  PaidTo: string
  Date: string
}>
export default async function editExpense(ID: number, updated: PatchExpense) {
  try {
    const res = await fetch(`${api}/expenses/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchExpense
  } catch (error) {
    throw error
  }
}
