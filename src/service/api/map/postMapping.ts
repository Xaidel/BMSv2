import { api } from "@/service/api"
import { Mapping } from "./getMapping"

type MappingPostRes = {
  mapping: Mapping
}

export default async function postMapping(mapping:
  {
    MappingName: string,
    Type: string,
    HouseholdID: number | null,
    FID: number | null,
  }
) {
  try {
    const res = await fetch(`${api}/mappings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mapping)
    })
    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as Promise<MappingPostRes>
  } catch (error) {
    throw error
  }
}
