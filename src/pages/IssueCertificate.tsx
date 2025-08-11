import { CertificateRegistry } from "@/features/certificate/certificateRegistry"
import { useParams } from "react-router-dom"

export default function IssueCertificate() {
  const { template } = useParams<{ template: string }>()
  const Component = template ? CertificateRegistry[template] : null
  return (
    <>
      <div className="w-full h-full">
        {Component ? <Component /> : <p>Template not found</p>}
      </div>
    </>
  )
}
