import sanitize from "../sanitize";


type CertificateLike = {
  resident_name?: string;
  name?: string;
  type_?: string;
  issued_date?: string | Date;
  IssuedDate?: string;
  ResidentName?: string;
  Type_?: string;
};

export default function searchCertificate<T extends CertificateLike>(
  term: string,
  data: T[]
): T[] {
  const sanitized = sanitize(term);
  const pattern = new RegExp(sanitized, "i");

  return data.filter(
    (item) =>
      pattern.test(item.resident_name ?? item.ResidentName ?? item.name ?? "") ||
      pattern.test(item.type_ ?? item.Type_ ?? "") ||
      pattern.test(
        new Date(item.issued_date ?? item.IssuedDate ?? "").toLocaleDateString()
      )
  );
}
