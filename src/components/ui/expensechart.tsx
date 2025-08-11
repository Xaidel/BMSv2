import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./chart";
import { Pie, PieChart } from "recharts";

type Data = {
  source: string,
  description: string,
  fill: string
  value: number,
}

type ChartProps = {
  data: Data[]
}

const chartConfig = {
  source: {
    label: "Source"
  },
  value: {
    label: "Value"
  }
} satisfies ChartConfig

export default function ExpenseChart({ data }: ChartProps) {
  return (
    <Card className="flex flex-col   ">
      <CardHeader className="m-0">
        <CardTitle>Expenditures</CardTitle>
        <CardDescription>Visual Summary of Barangay Expense Sources</CardDescription>
      </CardHeader>
      <CardContent className="flex  ">
        <div className="hidden xl:block" >
          {data.map((d, i) => {
            return <div key={i} className="flex gap-1 items-normal mt-1">
              <div className="w-[1.5rem] h-[3rem] rounded-[4px]" style={{ backgroundColor: d.fill }} />
              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-[1rem] leading-5 md:text-red">{d.source}</h2>
                <p className="text-[0.8rem] font-light ">{d.description}</p>
              </div>
            </div>
          })}
        </div>
        <ChartContainer
          config={chartConfig}
          className="text-xs font-bold h-[14rem] mx-auto"
        >
          <PieChart >
            <ChartTooltip content={(props) => <ChartTooltipContent {...props} hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="source"
              cy="50%"
              cx="50%"
              label={({ value }) => `₱${new Intl.NumberFormat("en-PH").format(value)}`}
              labelLine={false}
            >
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card >
  )
}
