import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

type SearchbarParams = {
  placeholder: string
  classname?: string
  onChange: (searchTerm: string) => void
}

export default function Searchbar({ placeholder, classname, onChange }: SearchbarParams) {
  return <div className={cn("relative", classname)}>
    <Input
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)

      }
      className="min-h-12 border-1 border-black/50 pl-16"
      autoComplete="on"
      placeholder={placeholder}
    />
    <div className="w-2 h-2 absolute inset-y-3 left-6 items-center ">
      <Search />
    </div>
  </div>
}
