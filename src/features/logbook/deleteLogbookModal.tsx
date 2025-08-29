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
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

type DeleteLogbookModalProps = {
  id: number;
  name: string;
  date: string;
  onDelete: () => void;
};

export default function DeleteLogbookModal({ id, name, date, onDelete }: DeleteLogbookModalProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await invoke("delete_logbook_entry_command", { id });
      toast.success("Logbook entry deleted");
      setOpen(false);
      onDelete?.();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete logbook entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black">
        <DialogHeader>
          <DialogTitle>Delete Logbook Entry?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete logbook entry for {name} on {date}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="text-black border-gray-200">
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
