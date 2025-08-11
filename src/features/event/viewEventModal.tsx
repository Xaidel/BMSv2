import type { Event as EventType } from "@/types/types";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/types/formSchema";
import { CalendarIcon, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

const selectOption: string[] = [
  "Seminar",
  "Assembly",
]

export default function ViewEventModal(props: EventType & { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: props.name,
      type_: props.type_,
      status: props.status,
      // Ensure date is always a Date object, even if props.date is already a Date or a string
      date: props.date instanceof Date ? props.date : new Date(props.date),
      venue: props.venue,
      attendee: props.attendee,
      notes: props.notes
    }
  })

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    try {
      // Ensure date is passed as ISO string, and id is attached
      const eventWithId = {
        ...values,
        id: props.id,
        date: values.date instanceof Date ? values.date.toISOString() : new Date(values.date).toISOString(),
        status: values.status,
      };

      await invoke("save_event_command", { event: eventWithId });

      toast.success("Event updated successfully", {
        description: `${values.name} was updated.`,
      });

      setOpenModal(false);
      props.onSave();
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  
  return (
    <>
      <Dialog
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <DialogTrigger asChild>
          <Button>
            <Eye />
            View Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((onSubmit))}>
              <DialogHeader>
                <DialogTitle className="text-black">Event Details</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">Basic Event Information</p>
              </DialogHeader>
                {/* Status field - only show if NOT Finished */}
              <div className="flex flex-col gap-3">
                <div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="text-black font-bold text-xs">Name</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
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
                    name="type_"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel htmlFor="type" className="text-black font-bold text-xs">Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder={"Please select the event type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectOption.map((option, i) => (
                              <SelectItem value={option} key={i}>{option}</SelectItem>
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
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="date" className="text-black font-bold text-xs">Date</FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <FormControl>
                            <PopoverTrigger
                              asChild
                              className="w-full text-black hover:bg-primary hover:text-white"
                            >
                              <Button
                                variant="outline"
                              >
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
                              disabled={(date) =>
                                date < new Date()
                              }
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
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="text-black font-bold text-xs">Venue</FormLabel>
                        <FormControl>
                          <Input
                            id="venue"
                            type="text"
                            placeholder="Enter Venue Location"
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
                    name="attendee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="text-black font-bold text-xs">Attendee</FormLabel>
                        <FormControl>
                          <Input
                            id="attendee"
                            type="text"
                            placeholder="Enter Attendees"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="text-black font-bold text-xs">Important Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            id="notes"
                            name="notes"
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
                  <div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="status" className="text-black font-bold text-xs">Status</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("status", value as any);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full text-black border-black/15">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="Finished">Finished</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                  <Button type="submit">
                    Save
                  </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog >
    </>
  )
}
