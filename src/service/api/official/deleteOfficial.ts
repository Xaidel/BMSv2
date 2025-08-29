import { api } from "@/service/api"
import { ErrorResponse } from "../auth/login"

export default async function deleteOfficial(ids: number[]) {
  try {
    const res = await fetch(`${api}/officials`, {
      method: "DELETE",
      headers: {
        Accept: "application/json"
      },
      body: JSON.stringify({ ids })
    })
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    if (res.status === 204) {
      return null
    }
    return res.json()
  } catch (error) {
    throw error
  }
}
