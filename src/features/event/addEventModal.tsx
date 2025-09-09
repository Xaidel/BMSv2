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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useAddEvent } from "../api/event/useAddEvent";
import { Event } from "@/types/apitypes";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { eventSchema } from "@/types/formSchema";

const selectOption: string[] = [
  "Assembly",
  "Health and Social Services",
  "Disater Preparedness and Environmental",
  "Education and Skill Development",
  "Cultural, Recreational, and Sports",
  "Law Enforcement and Community Safety",
  "Humanitarian Assistance",
  "Others",
];

const statusOption = ["Upcoming", "Ongoing", "Finished", "Cancelled"] as const;

export default function AddEventModal() {
  const addMutation = useAddEvent();
  const queryClient = useQueryClient();

  const handleAdd = async (values: z.infer<typeof eventSchema>) => {
    toast.promise(addMutation.mutateAsync(values as Event), {
      loading: "Adding Event please wait...",
      success: (data) => {
        const e = data.event;
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["events"] });
        return {
          message: "Event added successfully",
          description: `${e.Name} was added`,
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding event failed",
          description: `${error.error}`,
        };
      },
    });
  };
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);


  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      Name: "",
      Type: "",
      Date: new Date(),
      Venue: "",
      Audience: "",
      Notes: "",
      Status: "Upcoming",
    },
  });

  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)}>
              <DialogHeader>
                <DialogTitle className="text-black">Create Event</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Event Information
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div>
                  <FormField
                    control={form.control}
                    name="Type"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel
                          htmlFor="Type"
                          className="text-black font-bold text-xs"
                        >
                          Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue
                                placeholder={"Please select the event type"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectOption.map((option, i) => (
                              <SelectItem value={option} key={i}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="name"
                          className="text-black font-bold text-xs"
                        >
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Name"
                            type="text"
                            placeholder="Enter event name"
                            required
                            {...field}
                            className="text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="date"
                          className="text-black font-bold text-xs"
                        >
                          Date
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
                                  format(field.value, "PPP")
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
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="name"
                          className="text-black font-bold text-xs"
                        >
                          Venue
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Venue"
                            type="text"
                            placeholder="Enter Venue Location"
                            required
                            {...field}
                            className="text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="name"
                          className="text-black font-bold text-xs"
                        >
                          Attendee
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Audience"
                            type="text"
                            placeholder="Enter Attendees"
                            required
                            {...field}
                            className="text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="name"
                          className="text-black font-bold text-xs"
                        >
                          Important Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="Notes"
                            name="Notes"
                            placeholder="Enter important notes"
                            required
                            className="text-black"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="status"
                          className="text-black font-bold text-xs"
                        >
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue
                                placeholder={"Select event status"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOption.map((option, i) => (
                              <SelectItem value={option} key={i}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Event</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
