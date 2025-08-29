import { api } from "@/service/api"
export type PatchLogbook = Partial<{
  ID: number;
  Name: string;
  Date: Date;
  TimeInAm?: string;
  TimeOutAm?: string;
  TimeInPm?: string;
  TimeOutPm?: string;
  Remarks?: string;
  Status?: string;
  TotalHours?: number;
}>
export default async function editLogbook(ID: number, updated: PatchLogbook) {
  try {
    const res = await fetch(`${api}/logbooks/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchLogbook
  } catch (error) {
    throw error
  }
}
