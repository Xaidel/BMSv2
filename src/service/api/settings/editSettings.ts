import { api } from "@/service/api"
export type PatchSettings = Partial<{
  Barangay: string
  Municipality: string
  Province: string
  ContactNumber: string
  Email: string
  ImageB: string | null
  ImageM: string | null
}>
export default async function editSettings(ID: number, updated: PatchSettings) {
  try {
    const res = await fetch(`${api}/settings/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchSettings
  } catch (error) {
    throw error
  }
}
