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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { blotterSchema } from "@/types/formSchema";





export default function AddBlotterModal({ onSave }: { onSave?: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof blotterSchema>>({
    resolver: zodResolver(blotterSchema),
    defaultValues: {
      id: 0,
      type_: "",
      reported_by: "",
      involved: "",
      incident_date: new Date(),
      location: "",
      zone: "",
      status: "Active",
      narrative: "",
      action: "",
      witnesses: "",
      evidence: "",
      resolution: "",
      hearing_date: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof blotterSchema>) {
    try {
      await invoke("insert_blotter_command", {
        blotter: {
          ...values,
          incident_date: values.incident_date.toISOString(),
          hearing_date: values.hearing_date.toISOString(),
        },
      });

      toast.success("Blotter added successfully", {
        description: `${values.reported_by} vs ${values.involved}`,
      });

      setOpenModal(false);
      form.reset();
      onSave?.(); // trigger refresh
    } catch (error) {
      console.error("Insert blotter failed:", error);
      toast.error("Failed to add blotter.");
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Add Blotter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto text-black">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Blotter Information</DialogTitle>
              <DialogDescription>
                All the fields are required unless it is mentioned otherwise
              </DialogDescription>
            </DialogHeader>

            {step === 1 && (
              <>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Blotter Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="type_"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input
                              id="type_"
                              type="text"
                              placeholder="Enter crime type"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="reported_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reported By</FormLabel>
                          <FormControl>
                            <Input
                              id="reported_by"
                              type="text"
                              placeholder="Enter middle name"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="involved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Involved</FormLabel>
                          <FormControl>
                            <Input
                              id="involved"
                              type="text"
                              placeholder="Enter middle name"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="incident_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incident</FormLabel>
                          <Popover
                            open={openCalendar}
                            onOpenChange={setOpenCalendar}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="center"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barangay</FormLabel>
                          <FormControl>
                            <Input
                              id="location"
                              type="text"
                              placeholder="Enter Barangay/Location"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone</FormLabel>
                          <FormControl>
                            <Input
                              id="zone"
                              type="text"
                              placeholder="Enter Zone/Purok"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Blotter Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="narrative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Narrative Report</FormLabel>
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
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Taken</FormLabel>
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
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="witnesses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Witnesses</FormLabel>
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
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="evidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidence</FormLabel>
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
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="resolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution/Settlement</FormLabel>
                          <FormControl>
                            <Input
                              id="resolution"
                              type="text"
                              placeholder="Enter resolution/settlement"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="hearing_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Hearing</FormLabel>
                          <Popover
                            open={openCalendar}
                            onOpenChange={setOpenCalendar}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="center"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Save Blotter</Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
