import { api } from "@/service/api"
export type PatchHousehold = {
  HouseholdNumber: string;
  Type: string;
  Members: { ID: number; Role: string }[];
  Zone: string;
  DateOfResidency: string;
  Status: string;
};
export default async function editHousehold(ID: number, updated: PatchHousehold) {
  try {
    const res = await fetch(`${api}/households/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return (await res.json()) as PatchHousehold
  } catch (error) {
    throw error
  }
}
