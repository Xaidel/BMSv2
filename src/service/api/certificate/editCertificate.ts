import { api } from "@/service/api"
export type PatchCertificate = Partial<{
  Name: string
  Type: string
  Date: string
  Venue: string
  Audience: string
  Notes: string
  Status: "Upcoming" | "Ongoing" | "Finished" | "Cancelled"
}>
export default async function editCertificate(certificate_id: number, updated: PatchCertificate) {
  try {
    const res = await fetch(`${api}/certificates/${certificate_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchCertificate
  } catch (error) {
    throw error
  }
}
