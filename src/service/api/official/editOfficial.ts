import { api } from "@/service/api"
export type PatchOfficial = Partial<{
  Name: string
  Role: string
  Section: string
  Image: string
  Age: number
  Contact: string
  Zone: string
  TermStart: string
  TermEnd: string
}>
export default async function editOfficial(ID: number, updated: PatchOfficial) {
  try {
    const res = await fetch(`${api}/officials/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchOfficial
  } catch (error) {
    throw error
  }
}
