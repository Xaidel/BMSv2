import { BlotterRegistry } from "@/features/blotter/blotterRegistry"
import { useParams } from "react-router-dom"

export default function IssueBlotter() {
  const { template } = useParams<{ template: string }>()
  const Component = template ? BlotterRegistry[template] : null
  return (
    <>
      <div className="w-full h-full">
        {Component ? <Component /> : <p>Template not found</p>}
      </div>
    </>
  )
}
