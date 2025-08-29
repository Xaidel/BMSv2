import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { logbookSchema } from "@/types/formSchema";
import { invoke } from "@tauri-apps/api/core";
import { Logbook } from "@/types/apitypes";
import editLogbook from "@/service/api/logbook/editLogbook";
import { useEditLogbook } from "../api/logbook/useEditLogbook";

type ViewLogbookModal = {
  logbook: Logbook;
  open: boolean;
  onClose: () => void;
};

export default function ViewLogbookModal({logbook,onClose,open}: ViewLogbookModal) {
  const [openCalendar, setOpenCalendar] = useState(false);

  const form = useForm<z.infer<typeof logbookSchema>>({
    resolver: zodResolver(logbookSchema),
    defaultValues: {
      Name: logbook.Name,
      Date: logbook.Date,
      TimeInAm: logbook.TimeInAm,
      TimeOutAm: logbook.TimeOutAm,
      TimeInPm: logbook.TimeInPm,
      TimeOutPm: logbook.TimeOutPm,
      Remarks: logbook.Remarks,
      Status: logbook.Status,
      TotalHours: logbook.TotalHours,
    },
  });

   async function onSubmit(values: z.infer<typeof logbookSchema>) {
      const updatedFields: Partial<z.infer<typeof logbookSchema>> = {};

    if (values.Name !== logbook.Name) updatedFields.Name = values.Name;
    if (values.Date.getTime() !== new Date(logbook.Date).getTime())
      updatedFields.Date = values.Date;
    if (values.TimeInAm !== logbook.TimeInAm) updatedFields.TimeInAm = values.TimeInAm;
    if (values.TimeOutAm !== logbook.TimeOutAm) updatedFields.TimeOutAm = values.TimeOutAm;
    if (values.TimeInPm !== logbook.TimeInPm) updatedFields.TimeInPm = values.TimeInPm;
    if (values.TimeOutPm !== logbook.TimeOutPm) updatedFields.TimeOutPm = values.TimeOutPm;
    if (values.Remarks !== logbook.Remarks) updatedFields.Remarks = values.Remarks;
    if (values.Status !== logbook.Status) updatedFields.Status = values.Status;
    if (values.TotalHours !== logbook.TotalHours) updatedFields.TotalHours = values.TotalHours;

    const payload = {
      ...updatedFields,
      ...(updatedFields.Date
        ? { Date: updatedFields.Date instanceof Date ? updatedFields.Date : new Date(updatedFields.Date) }
        : {}),
    };

      toast.promise(editLogbook(logbook.ID, payload), {
       loading: "Updating logbook...",
       success: "Logbook updated successfully",
       error: "Failed to update logbook",
     });
      onClose();
    }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-black">View Logbook Entry</DialogTitle>
              <DialogDescription className="text-sm">
                Edit or review the logbook entry details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Official Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value ?? ""}
                        readOnly
                        className="text-black bg-gray-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Date */}
              <FormField
                control={form.control}
                name="Date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Date</FormLabel>
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full text-black">
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          onDayClick={() => setOpenCalendar(false)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Time fields */}
              <FormField
                control={form.control}
                name="TimeInAm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Time In AM</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TimeOutAm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Time Out AM</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TimeInPm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Time In PM</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TimeOutPm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Time Out PM</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Remarks */}
                <FormField
                  control={form.control}
                  name="Remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Remarks
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Remarks"
                          {...field}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Status */}
                <FormField
                  control={form.control}
                  name="Status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Status
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Status"
                          {...field}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              {/* Total Hours */}
              <FormField
                control={form.control}
                name="TotalHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">Total Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value !== undefined ? `${field.value} hrs` : ""}
                        readOnly
                        className="text-black bg-gray-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Save Entry</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}