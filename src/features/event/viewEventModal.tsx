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
import { Event } from "@/types/apitypes";
import { useEditEvent } from "../api/event/useEditEvent";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const selectOption: string[] = [
  "Assembly",
  "Health and Social Services",
  "Disater Preparedness and Environmental",
  "Education and Skill Development",
  "Cultural, Recreational, and Sports",
  "Law Enforcement and Community Safety",
  "Humanitarian Assistance"
]

export default function ViewEventModal({ event, open, onClose }: { event: Event, open: boolean, onClose: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false)
  // const [openModal, setOpenModal] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      Name: event.Name,
      Type: event.Type,
      Status: event.Status,
      // Ensure date is always a Date object, even if props.date is already a Date or a string
      Date: event.Date instanceof Date ? event.Date : new Date(event.Date),
      Venue: event.Venue,
      Audience: event.Audience,
      Notes: event.Notes
    }
  })

  const editMutation = useEditEvent()

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    type EventPatch = Partial<Omit<z.infer<typeof eventSchema>, "Date"> & { Date: string }>

    const updated: EventPatch = {}
    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values]
      let eventValue = event[key as keyof Event]

      if (key === "Date" && typeof eventValue === "string") {
        eventValue = new Date(eventValue) as any
      }

      if (formValue !== eventValue) {
        if (key === "Date" && formValue instanceof Date) {
          updated.Date = formValue.toISOString()
        } else {
          updated[key as keyof EventPatch] = formValue as any
        }
      }
    })
    toast.promise(
      editMutation.mutateAsync({ ID: event.ID, updated }), {
      loading: "Editing new event please wait...",
      success: (data) => {
        queryClient.invalidateQueries({ queryKey: ['events'] })
        onClose()
        return {
          message: "Event edited successfully",
          description: `${event.Name} was edited`
        }
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing event failed",
          description: `${error.error}`
        }
      }
    }
    )
  }
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onClose}
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
              <div className="flex flex-col gap-3">
                <div>
                  <FormField
                    control={form.control}
                    name="Name"
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
                    name="Type"
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
                    name="Date"
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
                    name="Venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="venue" className="text-black font-bold text-xs">Venue</FormLabel>
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
                    name="Audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="audience" className="text-black font-bold text-xs">Attendee</FormLabel>
                        <FormControl>
                          <Input
                            id="audience"
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
                    name="Notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="notes" className="text-black font-bold text-xs">Important Notes</FormLabel>
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
                      name="Status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="status" className="text-black font-bold text-xs">Status</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("Status", value as any);
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
