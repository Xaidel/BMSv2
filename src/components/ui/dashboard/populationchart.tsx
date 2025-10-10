import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { ChartContainer, type ChartConfig } from "../chart";
const chartConfig = {
  population: {
    label: "Population",
    color: "#5165F6",
  }
} satisfies ChartConfig

type Data = {
  population: number,
  zone: number
}

type ChartProps = {
  data: Data[]
}

export default function PopulationChart({ data }: ChartProps) {
  return (
    <Card className="w-full  flex flex-col">
      <CardHeader>
        <CardTitle>Population</CardTitle>
        <CardDescription>Resident Distribution by Zone</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[16rem] w-full">
          <BarChart accessibilityLayer data={data} >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="zone"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `Zone ${value}`}
            />
            <Bar dataKey="population" fill="#5165F6" radius={20} barSize={150} />
            <YAxis
              tickMargin={10}
              dataKey="population"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
