import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Income } from "@/types/apitypes";

export interface IncomeResponse {
  incomes: Income[]
}

export default async function getEvent(id?: number): Promise<IncomeResponse> {
  try {
    const url = id ? `${api}/incomes/${id}` : `${api}/incomes`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<IncomeResponse>
  } catch (error) {
    throw error
  }
} 
