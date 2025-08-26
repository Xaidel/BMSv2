import { Income } from "@/types/apitypes"


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
  return [...data].sort((a, b) => b.Amount - a.Amount)
}
function sortDateDesc(data: Income[]): Income[] {
  return [...data].sort((a, b) => b.DateReceived.getTime() - a.DateReceived.getTime())
}
function filterThisWeek(data: Income[]): Income[] {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

  const weeklyData = data.filter((Income) => {
    const IncomeDate = new Date(Income.DateReceived);
    return IncomeDate >= currentWeekStart && IncomeDate < currentWeekEnd;
  });
  return weeklyData
}
function filterThisMonth(data: Income[]): Income[] {
  const now = new Date();
  return data.filter(
    (income) =>
      new Date(income.DateReceived).getMonth() === now.getMonth() &&
      new Date(income.DateReceived).getFullYear() === now.getFullYear()
  );
}
