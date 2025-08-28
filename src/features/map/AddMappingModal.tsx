import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Feature } from "geojson"
export default function AddMappingModal({ feature, dialogOpen, onOpenChange }: { feature: Feature, dialogOpen: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="text-black">
          <DialogTitle>Barangay Tambo Building Mapping</DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  )
}
