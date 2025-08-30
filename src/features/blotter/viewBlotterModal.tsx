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
import { Blotter } from "@/types/apitypes";
import { useQueryClient } from "@tanstack/react-query";
import { useEditBlotter } from "../api/blotter/useEditBlotter";

const selectStatus: string[] = [
  "On Going",
  "Active",
  "Transferred to Police",
  "Closed",
];

export default function ViewBlotterModal({
  blotter,
  open,
  onClose,
}: {
  blotter: Blotter;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const editMutation = useEditBlotter();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof blotterSchema>>({
    resolver: zodResolver(blotterSchema),
    defaultValues: {
      Type: blotter.Type,
      ReportedBy: blotter.ReportedBy,
      Involved: blotter.Involved,
      IncidentDate: new Date(blotter.IncidentDate),
      Location: blotter.Location,
      Zone: blotter.Zone,
      Status: blotter.Status,
      Narrative: blotter.Narrative,
      Action: blotter.Action,
      Witnesses: blotter.Witnesses,
      Evidence: blotter.Evidence,
      Resolution: blotter.Resolution,
      HearingDate: new Date(blotter.HearingDate),
    },
  });

  async function onSubmit(values: z.infer<typeof blotterSchema>) {
    type BlotterPatch = Partial<
      Omit<z.infer<typeof blotterSchema>, "IncidentDate" | "HearingDate"> & {
        IncidentDate: string;
        HearingDate: string;
      }
    >;

    const updated: BlotterPatch = {};
    (Object.keys(values) as (keyof BlotterPatch)[]).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      let blotterValue = blotter[key as keyof Blotter];

      // For date fields, parse the string to Date for comparison
      if (
        (key === "IncidentDate" || key === "HearingDate") &&
        typeof blotterValue === "string"
      ) {
        blotterValue = new Date(blotterValue) as any;
      }

      if (formValue !== blotterValue) {
        if (
          (key === "IncidentDate" || key === "HearingDate") &&
          formValue instanceof Date
        ) {
          (updated as any)[key] = formValue.toISOString();
        } else {
          (updated as Record<string, unknown>)[key] = formValue;
        }
      }
    });
    toast.promise(editMutation.mutateAsync({ ID: blotter.ID, updated }), {
      loading: "Editing new blotter please wait...",
      success: (blotter) => {
        queryClient.invalidateQueries({ queryKey: ["blotters"] });
        onClose();
        return {
          message: "Blotter edited successfully",
          description: `${blotter.Type} was edited`,
        };
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing blotter failed",
          description: `${error.error}`,
        };
      },
    });
  }

  return (
    <>
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
                        name="Type"
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
                                id="Type"
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
                        name="ReportedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="ReportedBy"
                              className="text-black font-bold text-xs"
                            >
                              Reported By
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="ReportedBy"
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
                        name="Involved"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Involved"
                              className="text-black font-bold text-xs"
                            >
                              Person Involved
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Involved"
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
                        name="IncidentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="IncidentDate"
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
                        name="Location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Location"
                              className="text-black font-bold text-xs"
                            >
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Location"
                                type="text"
                                placeholder="Enter Location"
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
                        name="Zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Zone"
                              className="text-black font-bold text-xs"
                            >
                              Zone/Purok
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Zone"
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
                        name="Status"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel
                              htmlFor="Status"
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
                                    placeholder={"Please select civil Status"}
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
                    <div></div>

                    <div>
                      <FormField
                        control={form.control}
                        name="Narrative"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Narrative"
                              className="text-black font-bold text-xs"
                            >
                              Narrative
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Narrative"
                                type="text"
                                placeholder="Enter Narrative"
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
                        name="Action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Action"
                              className="text-black font-bold text-xs"
                            >
                              Action Taken
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Action"
                                type="text"
                                placeholder="Enter Action taken"
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
                        name="Witnesses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Witnesses"
                              className="text-black font-bold text-xs"
                            >
                              Witnesses
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Witnesses"
                                type="text"
                                placeholder="Enter Witnesses"
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
                        name="Evidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Evidence"
                              className="text-black font-bold text-xs"
                            >
                              Evidence
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Evidence"
                                type="text"
                                placeholder="Enter Evidence"
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
                        name="Resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="Resolution"
                              className="text-black font-bold text-xs"
                            >
                              Resolution
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="Resolution"
                                type="text"
                                placeholder="Enter Resolution"
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
                        name="HearingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor="HearingDate"
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
                  {step === 2 && <Button type="submit">Save Blotter</Button>}
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
