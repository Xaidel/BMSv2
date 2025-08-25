import { useQueryClient } from "@tanstack/react-query"
import { useResident } from "../api/resident/useResident"
import { ResidentResponse } from "@/service/api/resident/getResident"
import { useMemo, useState } from "react"
import { getAge } from "@/lib/utils"

interface SelectedResident {
  id: string
  name: string
  role: string
  age: number
}
export default function ViewCaptainModal() {
  const { data: residentsData } = useResident()
  const [selectedResident, setSelectedResident] = useState<SelectedResident[]>([])
  const res = useMemo<SelectedResident[]>(() => {
    if (!residentsData?.residents) return []

    return residentsData.residents.map((r) => {
      const middleInitial = r.Middlename
        ? ` ${r.Middlename.charAt(0).toUpperCase()}.`
        : ""

      return {
        id: r.ID.toString(),
        name: `${r.Firstname}${middleInitial} ${r.Lastname}`.trim(),
        role: "",
        age: getAge(r.Birthday.toString())
      }
    })
  }, [residentsData])
  console.log(res)
  return (
    <>
      <div>

      </div>
    </>
  )
}

