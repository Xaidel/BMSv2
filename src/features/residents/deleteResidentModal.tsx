import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  id: number;
  full_name: string;
  onDelete?: () => void;
}

export default function DeleteResidentModal({ id, full_name, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await invoke("delete_resident_command", { id });
      toast.success("Resident deleted", {
        description: `${full_name} was deleted`,
      });
      setOpen(false);
      onDelete?.();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete resident");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black">
        <DialogHeader>
          <DialogTitle>Delete Resident?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete resident "{full_name}"?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <DialogClose asChild>
            <Button variant="ghost" className="text-black">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
