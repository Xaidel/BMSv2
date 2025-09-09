import { Button } from "@/components/ui/button"
import { useState } from "react"


interface SelectedResident {
  ID: string
  Name: string
  Role: string
  Age: number
  Zone: number
}
export default function ViewCaptainModal() {
  const [selectedResident,] = useState<SelectedResident[]>([])
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

