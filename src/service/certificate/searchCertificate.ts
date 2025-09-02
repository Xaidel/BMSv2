import sanitize from "../sanitize";


type Certificate = {
  ID: number;
  ResidentName: string;
  Type_: string;
  IssuedDate: string;
};

export default function searchCertificate(
  term: string,
  data: Certificate[]
): Certificate[] {
  const sanitized = sanitize(term);
  const pattern = new RegExp(sanitized, "i");

  return data.filter(
    (item) =>
      pattern.test(item.ResidentName) ||
      pattern.test(item.Type_) ||
      pattern.test(new Date(item.IssuedDate).toLocaleDateString())

  );
}
