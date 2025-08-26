import { api } from "@/service/api";
import { Income } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface IncomePostResponse {
  income: Income
}

export default async function postEvent(income: Income): Promise<IncomePostResponse> {

  try {
    const res = await fetch(`${api}/incomes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(income)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<IncomePostResponse>
  } catch (error) {
    throw error
  }

}
