import { api } from "@/service/api";
import { Youth } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface YouthPostResponse {
  youth: Youth;
}

export default async function postYouth(youth: Youth): Promise<YouthPostResponse> {
  try {
    const res = await fetch(`${api}/youth`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(youth)
    });
    if (!res.ok) {
      const error = (await res.json()) as ErrorResponse;
      throw error;
    }
    return res.json() as Promise<YouthPostResponse>;
  } catch (error) {
    throw error;
  }
}
