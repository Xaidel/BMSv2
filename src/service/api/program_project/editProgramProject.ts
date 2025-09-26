import { api } from "@/service/api"
export type PatchProgramProject = Partial<{
  Name: string
  Type: string
  Description: string
  StartDate: string
  EndDate: string
  Duration: string
  Location: string
  Beneficiaries: string
  Budget: string
  SourceOfFunds: string
  ProjectManager: string
  Status: "Upcoming" | "Ongoing" | "Finished" | "Cancelled"
}>
export default async function editProgramProject(ID: number, updated: PatchProgramProject) {
  try {
    const res = await fetch(`${api}/program-projects/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchProgramProject
  } catch (error) {
    throw error
  }
}
