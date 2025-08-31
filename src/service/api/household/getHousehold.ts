import { api } from "@/service/api";

export interface ResProps {
  ID: number;
  Income: number;
  Firstname: string;
  Lastname: string;
  Role: string;
}

export interface Household {
  ID?: number;
  HouseholdNumber: string;
  Type: string;
  Member: ResProps[];
  Head: string;
  Zone: string;
  Date: string; // ISO string
  Status: "Moved Out" | "Active" | string;
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
