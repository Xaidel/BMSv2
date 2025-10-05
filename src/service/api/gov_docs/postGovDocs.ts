import { api } from "@/service/api";
import { GovDoc } from "@/types/apitypes";
import { ErrorResponse } from "../auth/login";

export interface GovDocPostResponse {
  gov_doc: GovDoc
}

export default async function postGovDocs(govDoc: GovDoc): Promise<GovDocPostResponse> {

  try {
    const res = await fetch(`${api}/gov-docs`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(govDoc)
    })

    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<GovDocPostResponse>
  } catch (error) {
    throw error
  }

}
