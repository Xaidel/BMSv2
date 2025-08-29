import { api } from "@/service/api"
export interface ResProps {
  id: number;
  income: number
  firstname: string;
  lastname: string;
  role: string;
}

export interface HouseProps {
  id: number;
  household_number: string;
  date_of_residency: string; // ISO string
  status: string;
  type: string;
  zone: string;
  residents: ResProps[];
}

export type HouseholdResponse = {
  households: HouseProps[]
}

export type HouseholdByIDResponse = {
  household: HouseProps
}
export default async function getHousehold() {
  try {
    const res = await fetch(`${api}/households`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      const error = await res.json() as { error: string }
      throw error
    }
    return res.json() as Promise<HouseholdResponse>
  } catch (error) {
    throw error
  }
}

export async function getOneHousehold(id: number) {
  try {
    const res = await fetch(`${api}/households/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as Promise<HouseholdByIDResponse>
  } catch (error) {
    throw error
  }
}
