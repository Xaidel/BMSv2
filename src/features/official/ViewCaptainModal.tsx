import { useResident } from "../api/resident/useResident"
import { useMemo, useState } from "react"
import { getAge } from "@/lib/utils"
import useOfficial from "../api/official/useOfficial"

interface SelectedResident {
  id: string
  name: string
  role: string
  age: number
  zone: number
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
        age: getAge(r.Birthday.toString()),
        zone: r.Zone
      }
    })
  }, [residentsData])
  return (
    <>
      <div>

      </div>
    </>
  )
}

