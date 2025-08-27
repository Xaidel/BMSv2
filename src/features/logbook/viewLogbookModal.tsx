import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type ViewPropsLogbook = {
  id?: number;
  official_name: string;
  date: Date;
  time_in_am?: string;
  time_out_am?: string;
  time_in_pm?: string;
  time_out_pm?: string;
  remarks?: string;
  status?: string;
  total_hours?: number;
  onSave: () => void;
};

export default function ViewLogbookModal(props: ViewPropsLogbook) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<z.infer<typeof logbookSchema>>({
    resolver: zodResolver(logbookSchema),
    defaultValues: {
      official_name: props.official_name,
      date: props.date,
      time_in_am: props.time_in_am,
      time_out_am: props.time_out_am,
      time_in_pm: props.time_in_pm,
      time_out_pm: props.time_out_pm,
      remarks: props.remarks,
      status: props.status,
      total_hours: props.total_hours,
    },
  });

  async function onSubmit(values: z.infer<typeof logbookSchema>) {
    try {
      const logbookWithId = {
        ...values,
        id: props.id,
        date: values.date.toISOString(),
      };

      await invoke("save_logbook_entry_command", { entry: logbookWithId });

      toast.success("Logbook entry updated successfully");

      setOpenModal(false);
      props.onSave();
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button>
          <Eye />
          View More
        </Button>
      </DialogTrigger>
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
                name="official_name"
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
                name="date"
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
                name="time_in_am"
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
                name="time_out_am"
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
                name="time_in_pm"
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
                name="time_out_pm"
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Remarks
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter remarks"
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Status
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter status"
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
                name="total_hours"
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