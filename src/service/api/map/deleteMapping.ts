import { api } from "@/service/api"

export default async function deleteMapping(id: number) {
  try {
    const res = await fetch(`${api}/mapping/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    if (res.status === 204) {
      return null
    }
    return res.json()
  } catch (error) {
    throw error
  }
}
