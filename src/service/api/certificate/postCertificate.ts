import { api } from "@/service/api";
import { Certificate } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface CertificatePostResponse {
  certificate: Certificate
}

export default async function postCertificate(certificate: Certificate): Promise<CertificatePostResponse> {

  try {
    const res = await fetch(`${api}/certificates`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(certificate)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<CertificatePostResponse>
  } catch (error) {
    throw error
  }

}
