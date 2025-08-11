import { LucideProps } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface cardprops {
  title: string,
  count: number,
  icon: React.FC<LucideProps>
}
export default function CategoryCard({ title, count, icon }: cardprops) {
  const Icon = icon
  return (
    <div className="flex-1">
      <Card className="max-w-[22rem] min-w-[22rem] max-h-[10rem] min-h-[10rem] py-5">
        <CardHeader>
          <CardTitle className="flex text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between relative">
            <h1 className="text-4xl font-bold">{count}</h1>
            <div className="z-0 absolute bottom-[-1.5rem] right-3">
              <Icon />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
