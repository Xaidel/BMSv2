import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Feature } from "geojson"
export default function AddMappingModal({ feature, dialogOpen, onOpenChange }: { feature: Feature, dialogOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const type = feature?.properties?.type || "none"
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="text-black">
          <DialogTitle>{feature?.properties?.mapping_name || "Assign Building Type"}</DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  )
}
