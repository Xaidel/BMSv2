import { api } from "@/service/api";

export interface ResProps {
  ID: number;
  Income: number;
  Firstname: string;
  Lastname: string;
  Role: string;
}

export interface Household {
  id?: number;
  household_number: string;
  type: string;
  member: ResProps[];
  residents?: {
    firstname: string
    lastname: string
    id: number
    role: string
    income: number
  }[]
  head: string;
  zone: string;
  date_of_residency: string; // ISO string
  status: "Moved Out" | "Active" | string;
  SelectedResident?: string[];
}

export type HouseholdResponse = {
  households: Household[];
};

export type HouseholdByIDResponse = {
  household: Household;
};

export default async function getHousehold() {
  try {
    const res = await fetch(`${api}/households`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      const error = await res.json() as { error: string };
      throw error;
    }
    return res.json() as Promise<HouseholdResponse>;
  } catch (error) {
    throw error;
  }
}

export async function getOneHousehold(id: number) {
  try {
    const res = await fetch(`${api}/households/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      const errorData = await res.json() as { error: string };
      throw errorData;
    }
    return res.json() as Promise<HouseholdByIDResponse>;
  } catch (error) {
    throw error;
  }
}
