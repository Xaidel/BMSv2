import { api } from "@/service/api";
import { Expense } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface ExpensePostResponse {
  expense: Expense
}

export default async function postExpense(expense: Expense): Promise<ExpensePostResponse> {
  try {
    const res = await fetch(`${api}/expenses`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(expense)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<ExpensePostResponse>
  } catch (error) {
    throw error
  }

}
