import { api } from "@/service/api"
export type PatchBlotter = Partial<{
  ID: number
  Type: string
  ReportedBy: string
  Involved: string
  IncidentDate: string
  Location: string
  Zone: string
  Status: string
  Narrative: string
  Action: string
  Witnesses: string
  Evidence: string
  Resolution: string
  HearingDate: string
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
