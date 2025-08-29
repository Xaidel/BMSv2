import { api } from "@/service/api";
import { Logbook } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface LogbookPostResponse {
  logbook: Logbook
}

export default async function postIncome(logbook: Logbook): Promise<LogbookPostResponse> {
console.log(logbook.Name)
  try {
    const res = await fetch(`${api}/logbooks`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(logbook)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<LogbookPostResponse>
  } catch (error) {
    throw error
  }

}
