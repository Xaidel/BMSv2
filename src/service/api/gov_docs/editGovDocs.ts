import { api } from "@/service/api"
export type PatchGovDoc = Partial<{
  Title: string;
  Type: "Executive Order" | "Resolution" | "Ordinance";
  Description: string;
  DateIssued: string;
  Image: string;
}>
export default async function editGovDocs(ID: number, updated: PatchGovDoc) {
  try {
    const res = await fetch(`${api}/gov-docs/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })

    if (!res.ok) {
      const errorData = await res.json() as { error: string }
      throw errorData
    }
    return res.json() as PatchGovDoc
  } catch (error) {
    throw error
  }
}
