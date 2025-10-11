import { useResident } from "@/features/api/resident/useResident";
import { useEffect, useState } from "react";
import { useEvent } from "@/features/api/event/useEvent";
import { useIncome } from "@/features/api/income/useIncome";
import { useExpense } from "@/features/api/expense/useExpense";
import { useHousehold } from "@/features/api/household/useHousehold";
import { useYouth } from "@/features/api/youth/useYouth";
import YouthChart from "@/components/ui/dashboard/youthcahrt";
import CustomFemale from "@/components/icons/CustomFemale";
import CustomHouse from "@/components/icons/CustomHouse";
import CustomMale from "@/components/icons/CustomMale";
import CustomPopulation from "@/components/icons/CustomPopulation";
import CustomPWD from "@/components/icons/CustomPWD";
import CustomSenior from "@/components/icons/CustomSenior";
import CustomVoters from "@/components/icons/CustomVoters";
import CategoryCard from "@/components/ui/categorycard";
import ExpenseChart from "@/components/ui/dashboard/expensechart";
import Greet from "@/components/ui/dashboard/greetings";
import IncomeChart from "@/components/ui/dashboard/incomechart";
import PopulationChart from "@/components/ui/dashboard/populationchart";
import CustomCalendar from "@/components/icons/CustomCalendar";

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

const palette = [
  "#3F51B5", // blue-violet
  "#E91E63", // pink
  "#2196F3", // light blue
  "#8BC34A", // green
  "#FF5722", // orange
  "#00BCD4", // cyan
  "#9E9E9E", // gray
];

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

  // Youth chart data logic
  const { data: youthResponse } = useYouth();
  const youths = youthResponse?.youths || [];

  // Use static mapping for education chart data, to ensure consistent colors
  const educationChartData = [
    { source: "Elementary Level", value: youths.filter((y) => y.EducationalBackground === "Elementary Level").length, fill: "#4CAF50" },
    { source: "Elementary Grad", value: youths.filter((y) => y.EducationalBackground === "Elementary Grad").length, fill: "#8BC34A" },
    { source: "High School Level", value: youths.filter((y) => y.EducationalBackground === "High School Level").length, fill: "#FFC107" },
    { source: "High School Grad", value: youths.filter((y) => y.EducationalBackground === "High School Grad").length, fill: "#FF9800" },
    { source: "Vocational Grad", value: youths.filter((y) => y.EducationalBackground === "Vocational Grad").length, fill: "#9C27B0" },
    { source: "College Level", value: youths.filter((y) => y.EducationalBackground === "College Level").length, fill: "#03A9F4" },
    { source: "College Grad", value: youths.filter((y) => y.EducationalBackground === "College Grad").length, fill: "#2196F3" },
  ];

  const categoryChartData = [
    { source: "In School Youth", value: youths.filter((y) => y.InSchoolYouth).length, fill: "#4CAF50" },
    { source: "Out of School Youth", value: youths.filter((y) => y.OutOfSchoolYouth).length, fill: "#F44336" },
    { source: "Working Youth", value: youths.filter((y) => y.WorkingYouth).length, fill: "#2196F3" },
    { source: "Youth w/ Specific Needs", value: youths.filter((y) => y.YouthWithSpecificNeeds).length, fill: "#9C27B0" },
  ];

  // Additional youth chart data: Age Category and Work Status
  const ageCategoryChartData = [
    { source: "Child Youth (15-17 yrs old)", value: youths.filter((y) => y.AgeGroup === "Child Youth").length, fill: palette[0] },
    { source: "Core Youth (18-24 yrs old)", value: youths.filter((y) => y.AgeGroup === "Core Youth").length, fill: palette[1] },
    { source: "Young Adult (25-30 yrs old)", value: youths.filter((y) => y.AgeGroup === "Young Adult").length, fill: palette[2] },
  ];
  const workStatusChartData = [
    { source: "Employed", value: youths.filter((y) => y.WorkStatus === "Employed").length, fill: palette[3] },
    { source: "Unemployed", value: youths.filter((y) => y.WorkStatus === "Unemployed").length, fill: palette[4] },
    { source: "Self-Employed", value: youths.filter((y) => y.WorkStatus === "Self-Employed").length, fill: palette[5] },
    { source: "Currently looking for a job", value: youths.filter((y) => y.WorkStatus === "Currently looking for a job").length, fill: palette[0] },
    { source: "Not interested looking for a job", value: youths.filter((y) => y.WorkStatus === "Not interested looking for a job").length, fill: palette[6] },
  ];

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
              icon={CustomCalendar}
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
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2 ml-3">
            Financial Overview
          </h2>
          <div className="flex flex-row gap-5 w-full">
            <div className="w-[50%] min-w-[300px]">
              <IncomeChart data={incomeChartData} />
            </div>
            <div className="w-[50%] min-w-[300px]">
              <ExpenseChart data={expenseChartData} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2 ml-3">
            Youth Demographics Overview
          </h2>
          <div className="flex flex-row gap-5 w-full mt-4">
            <div className="w-[50%] min-w-[300px]">
              <YouthChart
                data={educationChartData}
                title="Educational Background"
                description="Distribution of Youth by Education Level"
              />
            </div>
            <div className="w-[50%] min-w-[300px]">
              <YouthChart
                data={categoryChartData}
                title="Youth Group Categories"
                description="In-School, Out-of-School, Working, and Special Needs Youth"
              />
            </div>
          </div>
          <div className="flex flex-row gap-5 w-full mt-4">
            <div className="w-[50%] min-w-[300px]">
              <YouthChart
                data={ageCategoryChartData}
                title="Age Categories"
                description="Distribution of Youth by Age Group"
              />
            </div>
            <div className="w-[50%] min-w-[300px]">
              <YouthChart
                data={workStatusChartData}
                title="Work Status Categories"
                description="Employment Status of Youth"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
