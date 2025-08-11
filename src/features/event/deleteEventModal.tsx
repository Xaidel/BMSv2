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
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";


interface Props {
  id: number;
  name: string;
  onDelete: () => void;
}

export default function DeleteEventModal({ id, name, onDelete }: Props) {
  async function onConfirm() {
    try {
      await invoke("delete_event_command", { id });
      toast.success("Event deleted", {
        description: `${name} was deleted.`,
      });
      onDelete();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XIcon />
          Delete Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black font-normal">Event Deletion</DialogTitle>
          <DialogDescription className="text-sm font-bold">
            This action cannot be undone once confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="text-black text-lg font-bold">
          Are you sure you want to delete this event?
        </div>
        <div className="flex w-full gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="ghost" className="text-black">
              Cancel
            </Button>
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
