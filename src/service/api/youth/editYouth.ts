import { api } from "@/service/api";
import { Youth } from "@/types/apitypes";

export default async function editYouth(youth_id: number, updated: Partial<Youth>) {
  try {
    const res = await fetch(`${api}/youths/${youth_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updated)
    });
    if (!res.ok) {
      const err = (await res.json()) as { error: string };
      throw err;
    }
    return res.json();
  } catch (error) {
    throw error;
  }
}
