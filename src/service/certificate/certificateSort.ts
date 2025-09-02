import { Certificate } from "@/types/apitypes";

export function sort(data: Certificate[], term: string): Certificate[] {
  switch (term) {
    case "Alphabetical":
      return sortAlphabetical(data);
    case "Active":
      return filterActive(data);
    case "Expired":
      return filterExpired(data);
    default:
      return data;
  }
}

function sortAlphabetical(data: Certificate[]): Certificate[] {
  return [...data].sort((a, b) =>
    a.ResidentName.localeCompare(b.ResidentName, undefined, { sensitivity: "base" })
  );
}

function filterActive(data: Certificate[]): Certificate[] {
  return data.filter((certificate) => {
    const oneYearLater = new Date(certificate.IssuedDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return new Date() <= oneYearLater;
  });
}

function filterExpired(data: Certificate[]): Certificate[] {
  return data.filter((certificate) => {
    const oneYearLater = new Date(certificate.IssuedDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return new Date() > oneYearLater;
  });
}
