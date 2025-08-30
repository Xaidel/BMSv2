import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Expense } from "@/types/apitypes";

export interface ExpenseResponse {
  expenses: Expense[]
}

export default async function getExpense(id?: number): Promise<ExpenseResponse> {
  try {
    const url = id ? `${api}/expenses/${id}` : `${api}/expenses`
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
    return res.json() as Promise<ExpenseResponse>
  } catch (error) {
    throw error
  }
} 
