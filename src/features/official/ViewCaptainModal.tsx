import { Button } from "@/components/ui/button"
import { useResident } from "../api/resident/useResident"
import { useMemo, useState } from "react"
import { getAge } from "@/lib/utils"


interface SelectedResident {
  ID: string
  Name: string
  Role: string
  Age: number
  Zone: number
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
        ID: r.ID.toString(),
        Name: `${r.Firstname}${middleInitial} ${r.Lastname}`.trim(),
        Role: "",
        Age: getAge(r.Birthday.toString()),
        Zone: r.Zone
      }
    })
  }, [residentsData])
  // Simulate saving selected residents
  const handleSave = () => {
    console.log(selectedResident)
    // TODO: Replace with API call to save selectedResident
  }
  return (
    <>
      <div>
        {/* Example form, can be extended as needed */}
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSave()
          }}
        >
          {/* You can add inputs here to select residents, etc. */}
          <Button type="submit">Save</Button>
        </form>
      </div>
    </>
  )
}

