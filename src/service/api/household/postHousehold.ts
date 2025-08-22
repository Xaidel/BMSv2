import { api } from "@/service/api"

export type HouseholdProps = {
  dateOfResidency: string; // ISO date string
  householdNumber: string;
  householdType: "owner" | "renter" | string;
  members: {
    id: number;
    role: string;
  }[];
  status: "active" | "inactive" | string;
  zone: string;
};
export default async function postHousehold(props: HouseholdProps) {
  try {
    const res = await fetch(`${api}/households`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(props)
    })
    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as Promise<HouseholdProps>
  } catch (error) {
    throw error
  }
}
