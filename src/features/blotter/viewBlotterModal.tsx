import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { blotterSchema } from "@/types/formSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { Blotter } from "@/types/types";
import { invoke } from '@tauri-apps/api/core';

const selectStatus: string[] = [
  "On Going",
  "Active",
  "Transferred to Police",
  "Closed",
];

export default function ViewBlotterModal(props: Blotter & { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof blotterSchema>>({
    resolver: zodResolver(blotterSchema),
    defaultValues: {
      type_: props.type_,
      reported_by: props.reported_by,
      involved: props.involved,
      incident_date: new Date(props.incident_date), // Convert string to Date
      location: props.location,
      zone: props.zone,
      status: props.status,
      narrative: props.narrative,
      action: props.action,
      witnesses: props.witnesses,
      evidence: props.evidence,
      resolution: props.resolution,
      hearing_date: new Date(props.hearing_date), // Convert string to Date
    },
  });

  async function onSubmit(values: z.infer<typeof blotterSchema>) {
    try {
      const blotterWithId = {
        ...values,
        id: props.id,
        incident_date: values.incident_date.toISOString(),
        hearing_date: values.hearing_date.toISOString(),
      };

      await invoke("save_blotter_command", { blotter: blotterWithId });

      toast.success("Blotter updated successfully", {
        description: `${values.type_} was updated.`,
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
                <DialogTitle className="text-black">
                  View More Details
                </DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Blotter Information
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {step === 1 && (
                  <>
                    <div>
                      <FormField
                        control={form.control}
                        name="type_"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="fullName"
                              className="text-black font-bold text-xs"
                            >
                              Type
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="type_"
                                type="text"
                                placeholder="Enter full name"
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
                        name="reported_by"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="reported_by"
                              className="text-black font-bold text-xs"
                            >
                              Reported By
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="reported_by"
                                type="text"
                                placeholder="Enter full name"
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
                        name="involved"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="involved"
                              className="text-black font-bold text-xs"
                            >
                              Person Involved
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="involved"
                                type="text"
                                placeholder="Enter full name"
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
                        name="incident_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="incident_date"
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
                                      <span>Date of Incident</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4  hover:text-white" />
                                  </Button>
                                </PopoverTrigger>
                              </FormControl>
                              <PopoverContent
                                className="w-auto p-0"
                                align="center"
                              >
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
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="location"
                              className="text-black font-bold text-xs"
                            >
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="location"
                                type="text"
                                placeholder="Enter location"
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
                        name="zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="zone"
                              className="text-black font-bold text-xs"
                            >
                              Zone/Purok
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="zone"
                                type="text"
                                placeholder="Enter full name"
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
                        name="status"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel
                              htmlFor="status"
                              className="text-black font-bold text-xs"
                            >
                              Status
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full text-black border-black/15">
                                  <SelectValue
                                    placeholder={"Please select civil status"}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectStatus.map((option, i) => (
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
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="narrative"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="narrative"
                              className="text-black font-bold text-xs"
                            >
                              Narrative
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="narrative"
                                type="text"
                                placeholder="Enter narrative"
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
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="action"
                              className="text-black font-bold text-xs"
                            >
                              Action Taken
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="action"
                                type="text"
                                placeholder="Enter action taken"
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
                        name="witnesses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="witnesses"
                              className="text-black font-bold text-xs"
                            >
                              Witnesses
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="witnesses"
                                type="text"
                                placeholder="Enter witnesses"
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
                        name="evidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="evidence"
                              className="text-black font-bold text-xs"
                            >
                              Evidence
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="evidence"
                                type="text"
                                placeholder="Enter evidence"
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
                        name="resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="resolution"
                              className="text-black font-bold text-xs"
                            >
                              Resolution
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="resolution"
                                type="text"
                                placeholder="Enter resolution"
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
                        name="hearing_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="hearing_date"
                              className="text-black font-bold text-xs"
                            >
                              Hearing Date
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
                                      <span>Date of Hearing</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4  hover:text-white" />
                                  </Button>
                                </PopoverTrigger>
                              </FormControl>
                              <PopoverContent
                                className="w-auto p-0"
                                align="center"
                              >
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
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                {/* Back Button on Left */}
                {step > 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <div /> // Keeps spacing even if Back is hidden
                )}

                {/* Next + Save on Right */}
                <div className="flex gap-2">
                  {step < 2 && (
                    <Button
                      type="button"
                      onClick={() => setStep((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  )}
                  {step === 2 && (
                    <Button type="submit">Save Blotter</Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
