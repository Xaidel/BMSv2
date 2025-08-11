import { Income } from "@/types/types";

export function sort(data: Income[], term: string): Income[] {
  switch (term) {
    case "Numerical":
      return sortNumerical(data)
    case "Date Issued":
      return sortDateDesc(data)
    case "This Week":
      return filterThisWeek(data)
    case "This Month":
      return filterThisMonth(data)
    default:
      return data
  }
}

function sortNumerical(data: Income[]): Income[] {
  return [...data].sort((a, b) => b.amount - a.amount)
}
function sortDateDesc(data: Income[]): Income[] {
  return [...data].sort((a, b) => b.date.getTime() - a.date.getTime())
}
function filterThisWeek(data: Income[]): Income[] {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

  const weeklyData = data.filter((income) => {
    const incomeDate = new Date(income.date);
    return incomeDate >= currentWeekStart && incomeDate < currentWeekEnd;
  });
  return weeklyData
}
function filterThisMonth(data: Income[]): Income[] {
  return data.filter((income) => income.date.getMonth() === new Date().getMonth())
}

