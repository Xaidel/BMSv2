import { api } from "@/service/api";
import { Youth } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface YouthResponse {
  youths: Youth[];
}

export default async function getYouth(id?: number): Promise<YouthResponse> {
  try {
    const url = id ? `${api}/youths/${id}` : `${api}/youths`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      const error = (await res.json()) as ErrorResponse;
      throw error;
    }
    return res.json() as Promise<YouthResponse>;
  } catch (error) {
    throw error;
  }
}
