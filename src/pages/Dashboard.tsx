import { useResident } from "@/features/api/resident/useResident";
import { useEffect, useState } from "react";
import { useEvent } from "@/features/api/event/useEvent";
import { useIncome } from "@/features/api/income/useIncome";
import { useExpense } from "@/features/api/expense/useExpense";
import { useHousehold } from "@/features/api/household/useHousehold";

import CustomFemale from "@/components/icons/CustomFemale";
import CustomHouse from "@/components/icons/CustomHouse";
import CustomMale from "@/components/icons/CustomMale";
import CustomPopulation from "@/components/icons/CustomPopulation";
import CustomPWD from "@/components/icons/CustomPWD";
import CustomSenior from "@/components/icons/CustomSenior";
import CustomVoters from "@/components/icons/CustomVoters";
import CategoryCard from "@/components/ui/categorycard";
import ExpenseChart from "@/components/ui/expensechart";
import Greet from "@/components/ui/greetings";
import IncomeChart from "@/components/ui/incomechart";
import PopulationChart from "@/components/ui/populationchart";

const categories = [];


export default function Dashboard() {
  const [populationData, setPopulationData] = useState<{ zone: number; population: number }[]>([]);
  const { data: residents } = useResident();
  const res = residents?.residents || [];
  const total = res.length;
  const registeredVotersTotal = res.filter((r) => r.IsVoter === true).length;
  const maleTotal = res.filter((r) => r.Gender === "Male").length;
  const femaleTotal = res.filter((r) => r.Gender === "Female").length;
  const pwdTotal = res.filter((r) => r.IsPWD === true).length;
  const seniorTotal = res.filter((r) => r.IsSenior === true).length;

  const zoneCountMap: Record<string, number> = {};
  for (const resident of res) {
    const zone = resident.Zone || "Unknown";
    if (!zoneCountMap[zone]) {
      zoneCountMap[zone] = 1;
    } else {
      zoneCountMap[zone]++;
    }
  }

  const zoneData = Object.entries(zoneCountMap).map(([zone, population]) => ({
    zone: isNaN(Number(zone)) ? 0 : Number(zone),
    population,
  })).sort((a, b) => a.zone - b.zone);

  useEffect(() => {
    setPopulationData(zoneData);
  }, [res]);

  const { data: eventResponse } = useEvent();
  const events = eventResponse?.events || [];
  const upcomingEventsTotal = events.filter((e) => e.Status === "Upcoming").length;

  const { data: householdResponse } = useHousehold();
  const householdTotal = householdResponse?.households?.length || 0;


  const { data: incomeResponse } = useIncome();
  const incomes = incomeResponse?.incomes || [];

  const totals: Record<string, number> = {};
  for (const income of incomes) {
    const category = income.Category;
    if (!totals[category]) {
      totals[category] = 0;
    }
    totals[category] += income.Amount;
  }

  const colorMap: Record<string, string> = {
    "Local Revenue": "#3F51B5",
    "Tax Revenue": "#E91E63",
    "Water System": "#2196F3",
    "Service Revenue": "#8BC34A",
    "Rental Income": "#FF5722",
    "Government Funds (IRA)": "#00BCD4",
    "Others": "#9E9E9E",
  };

  const incomeChartData = Object.entries(totals).map(([source, value]) => ({
    source,
    value,
    fill: colorMap[source] || "#ccc",
    description: {
      "Local Revenue": "Revenue collected within the barangay",
      "Tax Revenue": "Revenue from various local taxes",
      "Water System": "Funds provided by the government",
      "Service Revenue": "Income from services offered",
      "Rental Income": "Revenue from property rentals",
      "Government Funds (IRA)": "Internal Revenue Allotment",
      "Others": "Other income sources",
    }[source] || "No description available",
  }));

  const { data: expenseResponse } = useExpense();
  const expenses = expenseResponse?.expenses || [];

  const expenseTotals: Record<string, number> = {};
  for (const expense of expenses) {
    const category = expense.Category;
    if (!expenseTotals[category]) {
      expenseTotals[category] = 0;
    }
    expenseTotals[category] += expense.Amount;
  }

  const expenseColorMap: Record<string, string> = {
    "Infrastructure": "#3F51B5",
    "Honoraria": "#E91E63",
    "Utilities": "#2196F3",
    "Local Funds": "#8BC34A",
    "Foods": "#FF5722",
    "IRA": "#00BCD4",
    "Others": "#9E9E9E",
  };

  const expenseChartData = Object.entries(expenseTotals).map(([source, value]) => ({
    source,
    value,
    fill: expenseColorMap[source] || "#ccc",
    description: {
      "Infrastructure": "Spending on buildings, and roads",
      "Honoraria": "Payments given to public servants or officials",
      "Utilities": "Electricity, water, communication, etc.",
      "Local Funds": "Expenses covered by the local fund",
      "Foods": "Food expenses for programs, meetings, etc.",
      "IRA": "Portion of Internal Revenue Allotment spent",
      "Others": "Miscellaneous or unclassified expenses",
    }[source] || "No description available",
  }));

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden">
      {/* Wrapper that controls overall scale and margin */}
      <div className="scale-[81%] origin-top-left mx-auto w-[100%] box-border">
        <div className="ml-4">
          <Greet />
        </div>

        <div className="flex gap-6 my-6 flex-wrap justify-around flex-1">
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Households"
              count={householdTotal}
              icon={CustomHouse}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Population"
              count={total}
              icon={CustomPopulation}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Registered Voters"
              count={registeredVotersTotal}
              icon={CustomVoters}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Upcoming Events"
              count={upcomingEventsTotal}
              icon={CustomPopulation}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Male"
              count={maleTotal}
              icon={CustomMale}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Female"
              count={femaleTotal}
              icon={CustomFemale}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="PWD"
              count={pwdTotal}
              icon={CustomPWD}
            />
          </div>
          <div className="w-[22%] min-w-[150px]">
            <CategoryCard
              title="Senior"
              count={seniorTotal}
              icon={CustomSenior}
            />
          </div>
          {categories.map((category, i) => (
            <div key={i} className="w-[22%] min-w-[150px]">
              <CategoryCard
                title={category.title}
                count={category.count}
                icon={category.icon}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 ml-3 mr-0 w-full">
          <div className="w-[100%] min-w-[300px]">
            <PopulationChart data={populationData} />
          </div>
          <div className="flex flex-row gap-5 w-full">
            <div className="w-[50%] min-w-[300px]">
              <IncomeChart data={incomeChartData} />
            </div>
            <div className="w-[50%] min-w-[300px]">
              <ExpenseChart data={expenseChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
