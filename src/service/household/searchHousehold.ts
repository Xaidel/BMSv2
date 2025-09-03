// src/service/searchHousehold.ts
import { Household } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchHousehold(term: string, data: Household[]): Household[] {
  const sanitized = sanitize(term);
  const pattern = new RegExp(sanitized, "i");

  return data.filter(
    (household) =>
      pattern.test(household.type) ||
      pattern.test(household.head) ||
      pattern.test(household.household_number.toString()) ||
      pattern.test(household.zone) ||
      pattern.test(household.status)
  );
}
