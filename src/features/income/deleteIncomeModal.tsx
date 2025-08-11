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
  type_: string;
  category: string;
  onDelete?: () => void;
}

export default function DeleteIncomeModal({ id, type_, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await invoke("delete_income_command", { id });
      toast.success("Income deleted");
      setOpen(false);
      onDelete?.(); // Call parent refresh
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete income");
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
          <DialogTitle>Delete Income?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{type_}"?
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
