import { api } from "@/service/api";
import { Resident } from "@/types/apitypes";

export default async function editResident(resident_id: number, updated: Partial<Resident>) {
  try {
    const res = await fetch(`${api}/residents/${resident_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updated)
    })
    if (!res.ok) {
      const err = await res.json() as { error: string }
      throw err
    }
    return res.json()
  } catch (error) {
    throw error
  }
}
