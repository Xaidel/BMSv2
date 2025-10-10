import { api } from "@/service/api"

export default async function deleteResident(ids: number[]) {
  try {
    const res = await fetch(`${api}/youths`, {
      method: "DELETE",
      headers: {
        Accept: "application/json"
      },
      body: JSON.stringify({ ids })
    })
    if (!res.ok) {
      const error = await res.json()
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
