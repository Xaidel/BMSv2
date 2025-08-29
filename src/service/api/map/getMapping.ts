import { api } from "@/service/api"
import { HouseholdResponse } from "../household/getHousehold"
import { HouseholdProps } from "../household/postHousehold"

export type MappingResponse = {
  mappings: Mapping[]
}
export type Mapping = {
  Type: string
  FID: number
  HouseholdID: number
  Household: {

    DateOfResidency: string; // ISO date string
    HouseholdNumber: string;
    HouseholdType: "owner" | "renter" | string;
    Members: {
      id: number;
      role: string;
    }[];
    Status: "active" | "inactive" | string;
    Zone: string;
  }
  MappingName: string
  ID: number
}

export default async function getMapping() {
  try {
    const res = await fetch(`${api}/mappings`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as Promise<MappingResponse>
  } catch (error) {
    throw error
  }
}
