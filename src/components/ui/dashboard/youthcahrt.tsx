import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../chart";
import { Pie, PieChart } from "recharts";

type Data = {
  source: string;
  value: number;
  fill: string;
};

type ChartProps = {
  data: Data[];
  title: string;
  description: string;
};

const chartConfig = {
  source: { label: "Source" },
  value: { label: "Value" },
} satisfies ChartConfig;

export default function YouthChart({ data, title, description }: ChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="m-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex">
        <div className="hidden xl:block">
          {data.map((d, i) => (
            <div key={i} className="flex gap-2 items-center mt-1">
              <div className="w-[1.5rem] h-[1.5rem] rounded" style={{ backgroundColor: d.fill }} />
              <h2 className="font-bold text-[1rem] leading-5">{d.source}</h2>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="text-xs font-bold h-[14rem] mx-auto">
          <PieChart>
            <ChartTooltip content={(props) => <ChartTooltipContent {...props} hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="source"
              cy="50%"
              cx="50%"
              label={({ value }) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percent = total ? Math.round((value / total) * 100) : 0;
                return `${percent}% (${value})`;
              }}
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}