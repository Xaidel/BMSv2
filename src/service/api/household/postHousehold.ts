import { api } from "@/service/api"

export type Member = {
  ID: number;
  Role: string;
};

export type Household = {
  HouseNumber: string;
  Date: Date;
  Type: "owner" | "renter" | string;
  Member: Member[];
  Head: string;
  Status: "active" | "inactive" | string;
  Zone: string;
};

export default async function postHousehold(props: Household) {
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
    return res.json() as Promise<Household>
  } catch (error) {
    throw error
  }
}
