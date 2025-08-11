import sanitize from "../sanitize";


type Certificate = {
  id: any;
  resident_name: any;
  name: string;
  type_: string;
  issued_date: Date;
};

export default function searchCertificate(
  term: string,
  data: Certificate[]
): Certificate[] {
  const sanitized = sanitize(term);
  const pattern = new RegExp(sanitized, "i");

  return data.filter(
    (item) =>
      pattern.test(item.name) ||
      pattern.test(item.type_) ||
      pattern.test(item.issued_date.toLocaleDateString())

  );
}
