import { Button } from "@/components/ui/button";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { logbookSchema } from "@/types/formSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function AddLogbookModal({ onSave }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [officials, setOfficials] = useState<{id: number, full_name: string}[]>([]);
  const form = useForm<z.infer<typeof logbookSchema>>({
    resolver: zodResolver(logbookSchema),
    defaultValues: {
      official_name: "",
      date: new Date(),
      time_in_am: "00:00",
      time_out_am: "00:00",
      time_in_pm: "12:00",
      time_out_pm: "12:00",
      remarks: "",
      status: "Ongoing",
      total_hours: 0
    },
  });

  useEffect(() => {
    async function fetchOfficials() {
      try {
        const result = await invoke("fetch_all_officials_command") as {id: number, name: string}[];
        setOfficials(result.map(o => ({ id: o.id, full_name: o.name })));
      } catch (err) {
        console.error("Failed to fetch officials:", err);
        toast.error("Failed to load officials");
      }
    }
    fetchOfficials();
  }, []);

  async function onSubmit(values: z.infer<typeof logbookSchema>) {
    try {
      await invoke("insert_logbook_entry_command", {
        entry: {
          ...values,
          date: values.date.toISOString(), // must be string for Rust
        },
      });

      toast.success("Logbook Entry added successfully", {
        description: `Logbook entry was added.`,
      });

      setOpenModal(false);
      form.reset();
      onSave(); // refresh the data in parent
    } catch (err) {
      console.error("Insert logbook entry failed:", err);
      toast.error("Failed to add logbook entry");
    }
  }

  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Add Logbook Entry
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-black">Create Logbook Entry</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Logbook Information
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {/* Official Name */}
                <FormField
                  control={form.control}
                  name="official_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-black font-bold text-xs">
                        Official
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === "" ? undefined : value)}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger className="text-black w-full">
                            <SelectValue placeholder="Select an official">
                              {field.value}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {officials.map((official) => (
                              <SelectItem key={official.id} value={official.full_name}>
                                {official.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel
                        htmlFor="date"
                        className="text-black font-bold text-xs"
                      >
                        Date of Logbook Entry
                      </FormLabel>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <FormControl>
                          <PopoverTrigger
                            asChild
                            className="w-full text-black hover:bg-primary hover:text-white"
                          >
                            <Button variant="outline">
                              {field.value ? (
                                format(field.value, "MMMM d, yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4  hover:text-white" />
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
                {/* Time In AM */}
                <FormField
                  control={form.control}
                  name="time_in_am"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Time In AM
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          {...field}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Time Out AM */}
                <FormField
                  control={form.control}
                  name="time_out_am"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Time Out AM
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          {...field}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Time In PM */}
                <FormField
                  control={form.control}
                  name="time_in_pm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Time In PM
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          {...field}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Time Out PM */}
                <FormField
                  control={form.control}
                  name="time_out_pm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Time Out PM
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          {...field}
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
                {/* Total Hours */}
                <FormField
                  control={form.control}
                  name="total_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Total Hours
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Calculated automatically"
                          {...field}
                          className="text-black"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Logbook Entry</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
