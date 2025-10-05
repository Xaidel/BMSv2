import { GovDoc } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchGovDocs(term: string, data: GovDoc[]): GovDoc[] {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((govDoc: GovDoc) =>
    pattern.test(govDoc.Title) ||
    pattern.test(govDoc.Type) ||
    pattern.test(govDoc.Description)
  );
}
