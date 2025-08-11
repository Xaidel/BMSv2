import { Expense } from "@/types/types";

export function sort(data: Expense[], term: string): Expense[] {
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

function sortNumerical(data: Expense[]): Expense[] {
  return [...data].sort((a, b) => b.amount - a.amount)
}
function sortDateDesc(data: Expense[]): Expense[] {
  return [...data].sort((a, b) => b.date.getTime() - a.date.getTime())
}
function filterThisWeek(data: Expense[]): Expense[] {
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
function filterThisMonth(data: Expense[]): Expense[] {
  return data.filter((income) => income.date.getMonth() === new Date().getMonth())
}

