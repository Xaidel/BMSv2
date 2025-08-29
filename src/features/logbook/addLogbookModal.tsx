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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { logbookSchema } from "@/types/formSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

import { useQueryClient } from "@tanstack/react-query";
import { Logbook } from "@/types/apitypes";
import { ErrorResponse } from "@/service/api/auth/login";
import { useAddLogbook } from "../api/logbook/useAddLogbook";
import { useOfficial } from "../api/official/useOfficial";

export default function AddLogbookModal({  }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { data: officials } = useOfficial();
  const form = useForm<z.infer<typeof logbookSchema>>({
    resolver: zodResolver(logbookSchema),
    defaultValues: {
      Name: "",
      Date: new Date(),
      TimeInAm: "00:00",
      TimeOutAm: "00:00",
      TimeInPm: "12:00",
      TimeOutPm: "12:00",
      Remarks: "",
      Status: "Ongoing",
      TotalHours: 0,
    },
  });

  const addMutation = useAddLogbook();
  const queryClient = useQueryClient();

  async function onSubmit(values: z.infer<typeof logbookSchema>) {
    toast.promise(addMutation.mutateAsync(values as unknown as Logbook), {
      loading: "Adding logbook please wait...",
      success: () => {
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["logbooks"] });
        return {
          message: "Logbook added successfully",
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding logbook failed",
          description: `${error.error}`,
        };
      },
    });
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
                <DialogTitle className="text-black">
                  Create Logbook Entry
                </DialogTitle>
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
                  name="Name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-black font-bold text-xs">
                        Official
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "" ? undefined : value)
                          }
                          value={field.value ?? ""}
                        >
                          <SelectTrigger className="text-black w-full">
                            <SelectValue placeholder="Select an official">
                              {field.value}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {officials.officials.map((official) => (
                              <SelectItem key={official.ID} value={official.Name}>
                                {official.Name}
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
                  name="Date"
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
                  name="TimeInAm"
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
                  name="TimeOutAm"
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
                  name="TimeInPm"
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
                  name="TimeOutPm"
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
                  name="Remarks"
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
                  name="TotalHours"
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
