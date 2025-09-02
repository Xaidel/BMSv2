import { api } from "@/service/api"
export type PatchHousehold = Partial<{
  ID: number;
  household_number: string;
  type: string;
  member: {
    ID: number;
    Firstname: string;
    Lastname: string;
    Role: string;
    Income: number;
  }[];
  head: string;
  zone: string;
  date: string;
  status: "Moved Out" | "Active" | string;
  selected_resident?: string[];
}>;
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
    return res.json() as PatchHousehold
  } catch (error) {
    throw error
  }
}
