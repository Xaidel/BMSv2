import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Certificate } from "@/types/apitypes";

export interface CertificateResponse {
  certificates: Certificate[]
}

export default async function getCertificate(id?: number): Promise<CertificateResponse> {
  try {
    const url = id ? `${api}/certificate/${id}` : `${api}/certificates`
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
    return res.json() as Promise<CertificateResponse>
  } catch (error) {
    throw error
  }
} 
