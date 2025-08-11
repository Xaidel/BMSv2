import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Blotter } from "@/types/types";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

type DeleteBlotterModalProps = Blotter & {
  onDelete: () => void;
};

export default function DeleteBlotterModal({ id, type_, onDelete }: DeleteBlotterModalProps) {
  async function onConfirm() {
    try {
      await invoke("delete_blotter_command", { id });
      toast.success("Blotter deleted", {
        description: `${type_} was deleted.`,
      });
      onDelete(); // ✅ Refresh table
    } catch (error) {
      toast.error("Failed to delete blotter");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XIcon />
          Delete Blotter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black font-normal">Blotter Deletion</DialogTitle>
          <DialogDescription className="text-sm font-bold">
            This action cannot be undone once confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="text-black text-lg font-bold">
          Are you sure you want to delete this blotter?
        </div>
        <div className="flex w-full gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="ghost" className="text-black">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm Delete
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
