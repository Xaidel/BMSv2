import { api } from "@/service/api"
export type PatchCertificate = Partial<{
  Name: string
  ID: number
  Type: string
  Age: number
  CivilStatus: string
  Ownership: string
  Amount: string
  IssuedDate: string
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
