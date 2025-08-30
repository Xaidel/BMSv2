import { Expense } from "@/types/apitypes";

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
  return [...data].sort((a, b) => b.Amount - a.Amount)
}
function sortDateDesc(data: Expense[]): Expense[] {
  return [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
}
function filterThisWeek(data: Expense[]): Expense[] {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

  const weeklyData = data.filter((expense) => {
    const expenseDate = new Date(expense.Date);
    return expenseDate >= currentWeekStart && expenseDate < currentWeekEnd;
  });
  return weeklyData
}
function filterThisMonth(data: Expense[]): Expense[] {
  const now = new Date();
  return data.filter((expense) => {
    const expenseDate = new Date(expense.Date);
    return expenseDate.getMonth() === now.getMonth() &&
           expenseDate.getFullYear() === now.getFullYear();
  });
}
