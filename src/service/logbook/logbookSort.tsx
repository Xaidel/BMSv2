import { Logbook } from "@/types/apitypes";

export function sort(data: Logbook[], term: string): Logbook[] {
  switch (term) {
    case "Date ASC":
      return sortDateAsc(data);
    case "Date DESC":
      return sortDateDesc(data);
    case "Ongoing":
      return filterByOngoing(data);
    case "Half Day":
      return filterByHalfDay(data);
    case "Absent":
      return filterByAbsent(data);
    case "Active Today":
      return filterByActiveToday(data);
    case "All Logbook Entries":
      return [...data];
    case "This Month":
      return filterByThisMonth(data);
    default:
      return data;
  }
}

function sortDateAsc(data: Logbook[]): Logbook[] {
  return [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
}
function sortDateDesc(data: Logbook[]): Logbook[] {
  return [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
}
function filterByOngoing(data: Logbook[]): Logbook[] {
  return data.filter((entry) => entry.Status === "Ongoing");
}
function filterByHalfDay(data: Logbook[]): Logbook[] {
  return data.filter((entry) => entry.Status === "Half Day");
}
function filterByAbsent(data: Logbook[]): Logbook[] {
  return data.filter((entry) => entry.Status === "Absent");
}
function filterByActiveToday(data: Logbook[]): Logbook[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return data.filter((entry) => {
    const entryDate = new Date(entry.Date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
}
function filterByThisMonth(data: Logbook[]): Logbook[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  return data.filter((entry) => {
    const entryDate = new Date(entry.Date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
}