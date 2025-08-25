import { api } from "@/service/api"

export default async function getOfficial() {
  try {
    const res = await fetch(`${api}/officials`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const error = await res.json() as { error: string }
      throw error
    }
    return res.json() as Promise<Record<string, unknown>>
  } catch (error) {
    throw error
  }
}
