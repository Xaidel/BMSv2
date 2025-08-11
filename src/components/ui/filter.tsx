import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./select";
import { FilterIcon } from "lucide-react";

type FilterOption = {
  initial: string,
  filters: string[],
  classname?: string
  onChange: (value: string) => void
}

export default function Filter({ initial, filters, classname, onChange }: FilterOption) {
  return (
    <div className={cn("relative ", classname)}>
      <Select onValueChange={onChange}>
        <SelectTrigger className="min-h-12 border-1 w-full">
          <div className="flex gap-2 ">
            <FilterIcon />
            <span>Filter By:</span>
          </div>
          <SelectValue placeholder={initial} />
        </SelectTrigger>
        <SelectContent >
          <SelectGroup>
            <SelectLabel>Options</SelectLabel>
            {filters.map((filter, i) => (
              <SelectItem key={i} value={filter}>{filter}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
