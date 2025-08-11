import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
import { Household } from "@/types/types";
import type { Income, Expense } from "@/types/types";

const categories = [];




export default function Dashboard() {
  const [householdTotal, setHouseholdTotal] = useState(0);
  const [householdData, setHouseholdData] = useState<any[]>([]);
  const [residentTotal, setResidentTotal] = useState(0);
  const [registeredVotersTotal, setRegisteredVotersTotal] = useState(0);
  const [eventTotal, setEventTotal] = useState(0);
  const [upcomingEventsTotal, setUpcomingEventsTotal] = useState(0);
  const [maleTotal, setMaleTotal] = useState(0);
  const [femaleTotal, setFemaleTotal] = useState(0);
  const [pwdTotal, setPwdTotal] = useState(0);
  const [seniorTotal, setSeniorTotal] = useState(0);
  const [populationData, setPopulationData] = useState<{ zone: number; population: number }[]>([]);
  const [incomeChartData, setIncomeChartData] = useState<{ source: string; value: number; fill: string; description: string }[]>([]);
  const [expenseChartData, setExpenseChartData] = useState<{ source: string; value: number; fill: string; description: string }[]>([]);
  console.log(householdData, eventTotal)
  useEffect(() => {
    invoke<Household[]>("fetch_all_households_command")
      .then((fetched) => {
        const parsed = fetched.map((household) => ({
          ...household,
          date: new Date(household.date),
        }));
        setHouseholdData(parsed);
        setHouseholdTotal(parsed.length);
      })
      .catch((err) => {
        console.error("Failed to fetch households:", err);
        setHouseholdTotal(0);
      });
  }, []);

  useEffect(() => {
    invoke<any[]>("fetch_all_residents_command")
      .then((residents) => {
        setResidentTotal(residents.length);

        // Count by zone
        const zoneCountMap: Record<string, number> = {};
        for (const resident of residents) {
          const zone = resident.zone || "Unknown";
          if (!zoneCountMap[zone]) {
            zoneCountMap[zone] = 1;
          } else {
            zoneCountMap[zone]++;
          }
        }

        const zoneData = Object.entries(zoneCountMap).map(([zone, population]) => ({
          zone: isNaN(Number(zone)) ? 0 : Number(zone),
          population,
        }));

        // Optional: sort by zone number
        zoneData.sort((a, b) => a.zone - b.zone);

        setPopulationData(zoneData);

        // Other counts
        const registeredCount = residents.filter((r) => r.is_registered_voter === true).length;
        setRegisteredVotersTotal(registeredCount);
        setMaleTotal(residents.filter((r) => r.gender === "Male").length);
        setFemaleTotal(residents.filter((r) => r.gender === "Female").length);
        setPwdTotal(residents.filter((r) => r.is_pwd === true).length);
        setSeniorTotal(residents.filter((r) => r.is_senior === true).length);
      })
      .catch((err) => {
        console.error("Failed to fetch residents:", err);
        setResidentTotal(0);
        setRegisteredVotersTotal(0);
        setPwdTotal(0);
      });
  }, []);

  useEffect(() => {
    invoke<any[]>("fetch_all_events_command")
      .then((events) => {
        setEventTotal(events.length);
      })
      .catch((err) => {
        console.error("Failed to fetch events:", err);
        setEventTotal(0);
      });
  }, []);

  useEffect(() => {
    invoke<any[]>("fetch_all_events_command")
      .then((events) => {
        const upcoming = events.filter((e) => e.status === "Upcoming");
        setUpcomingEventsTotal(upcoming.length);
      })
      .catch((err) => {
        console.error("Failed to fetch upcoming events:", err);
        setUpcomingEventsTotal(0);
      });
  }, []);

  useEffect(() => {
    invoke<Income[]>("fetch_all_incomes_command")
      .then((fetched) => {
        const parsed = fetched.map((income) => ({
          ...income,
          date: new Date(income.date),
          category: income.category,
        }));

        const totals: Record<string, number> = {};
        for (const income of parsed) {
          if (!totals[income.category]) {
            totals[income.category] = 0;
          }
          totals[income.category] += income.amount;
        }

        const colorMap: Record<string, string> = {
          "Local Revenue": "#3F51B5",             // indigo
          "Tax Revenue": "#E91E63",               // pink
          "Government Grants": "#2196F3",         // blue
          "Service Revenue": "#8BC34A",           // light green
          "Rental Income": "#FF5722",             // deep orange
          "Government Funds (IRA)": "#00BCD4",    // cyan
          "Others": "#9E9E9E",                    // gray
        };

        const chartData = Object.entries(totals).map(([source, value]) => ({
          source,
          value,
          fill: colorMap[source] || "#ccc",
          description: {
            "Local Revenue": "Revenue collected within the barangay",
            "Tax Revenue": "Revenue from various local taxes",
            "Government Grants": "Funds provided by the government",
            "Service Revenue": "Income from services offered",
            "Rental Income": "Revenue from property rentals",
            "Government Funds (IRA)": "Internal Revenue Allotment",
            "Others": "Other income sources"
          }[source] || "No description available",
        }));

        setIncomeChartData(chartData);
      })
      .catch((err) => {
        console.error("Failed to fetch incomes:", err);
      });
  }, []);

  useEffect(() => {
    invoke<Expense[]>("fetch_all_expenses_command")
      .then((fetched) => {
        const parsed = fetched.map((expense) => ({
          ...expense,
          date: new Date(expense.date),
          category: expense.category,
        }));

        const totals: Record<string, number> = {};
        for (const expense of parsed) {
          if (!totals[expense.category]) {
            totals[expense.category] = 0;
          }
          totals[expense.category] += expense.amount;
        }

        const colorMap: Record<string, string> = {
          "Infrastructure": "#3F51B5",       // indigo
          "Honoraria": "#E91E63",            // pink
          "Utilities": "#2196F3",            // blue
          "Local Funds": "#8BC34A",          // light green
          "Foods": "#FF5722",                // deep orange
          "IRA": "#00BCD4",                  // cyan
          "Others": "#9E9E9E",               // gray
        };

        const chartData = Object.entries(totals).map(([source, value]) => ({
          source,
          value,
          fill: colorMap[source] || "#ccc",
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

        setExpenseChartData(chartData);
      })
      .catch((err) => {
        console.error("Failed to fetch expenses:", err);
      });
  }, []);

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
              count={residentTotal}
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
