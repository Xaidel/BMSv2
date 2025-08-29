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
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { officialSchema } from "@/types/formSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Official } from "@/types/apitypes";
import { useQueryClient } from "@tanstack/react-query";
import { useAddOfficial } from "../api/official/useAddOfficial";
import { ErrorResponse } from "@/service/api/auth/login";

export default function AddOfficialModal({ onSave }: { onSave: () => void }) {
  const [openCalendarTermStart, setOpenCalendarTermStart] = useState(false);
  const [openCalendarTermEnd, setOpenCalendarTermEnd] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm<z.infer<typeof officialSchema>>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      Name: "",
      Role: "",
      Image: "",
      Section: "",
      Age: undefined,
      Contact: "",
      TermStart: undefined,
      TermEnd: undefined,
      Zone: "",
    },
  });
  console.log(imagePreview);

  const addMutation = useAddOfficial();
  const queryClient = useQueryClient();
  async function onSubmit(values: z.infer<typeof officialSchema>) {
    const reformattedValues = {
      ...values,
      TermStart: values.TermStart
        ? new Date(values.TermStart).toISOString()
        : undefined,
      TermEnd: values.TermEnd
        ? new Date(values.TermEnd).toISOString()
        : undefined,
    };

    toast.promise(
      addMutation.mutateAsync(reformattedValues as unknown as Official),
      {
        loading: "Adding official, please wait...",
        success: () => {
          setOpenModal(false);
          setImagePreview("");
          form.reset();
          queryClient.invalidateQueries({ queryKey: ["officials"] });
          if (onSave) onSave();
          return { message: "Official added successfully" };
        },
        error: (error: ErrorResponse) => {
          return {
            message: "Adding official failed",
            description: `${error.error}`,
          };
        },
      }
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("Image", reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
      form.setValue("Image", "");
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus />
          Add Official
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="text-center text-black space-y-4"
          >
            <DialogHeader>
              <DialogTitle className="text-black">Create Official</DialogTitle>
              <DialogDescription className="text-sm">
                All the fields are required unless otherwise mentioned
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {/* Image Upload */}
              <FormField
                control={form.control}
                name="Image"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Upload Image
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="Image/*"
                        onChange={handleImageChange}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Section */}
              <FormField
                control={form.control}
                name="Section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Section
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full text-black border-black/15">
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Barangay Officials">
                            Barangay Officials
                          </SelectItem>
                          <SelectItem value="SK Officials">
                            SK Officials
                          </SelectItem>
                          <SelectItem value="Tanod Officials">
                            Tanod Officials
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Role */}
              <FormField
                control={form.control}
                name="Role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Role
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full text-black border-black/15">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("Section") === "Barangay Officials" && (
                            <>
                              <SelectItem value="Barangay Captain">
                                Barangay Captain
                              </SelectItem>
                              <SelectItem value="Barangay Councilor">
                                Barangay Councilor
                              </SelectItem>
                              <SelectItem value="Secretary">
                                Secretary
                              </SelectItem>
                              <SelectItem value="Treasurer">
                                Treasurer
                              </SelectItem>
                              <SelectItem value="Driver">Driver</SelectItem>
                              <SelectItem value="Care Taker">
                                Care Taker
                              </SelectItem>
                            </>
                          )}
                          {form.watch("Section") === "SK Officials" && (
                            <>
                              <SelectItem value="SK Chairman">
                                SK Chairman
                              </SelectItem>
                              <SelectItem value="SK Councilor">
                                SK Councilor
                              </SelectItem>
                            </>
                          )}
                          {form.watch("Section") === "Tanod Officials" && (
                            <>
                              <SelectItem value="Chief Tanod">
                                Chief Tanod
                              </SelectItem>
                              <SelectItem value="Tanod Member">
                                Tanod Member
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Name */}
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        className="text-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Age */}
              <FormField
                control={form.control}
                name="Age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : +e.target.value
                          )
                        }
                        value={field.value ?? ""}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Contact */}
              <FormField
                control={form.control}
                name="Contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Contact
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Contact info"
                        className="text-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Zone */}
              <FormField
                control={form.control}
                name="Zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Zone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Zone"
                        className="text-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Term Start and Term End in flex gap-2 */}
              <div className="flex gap-2">
                {/* Term Start */}
                <FormField
                  control={form.control}
                  name="TermStart"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-black font-bold text-xs">
                        Term Start
                      </FormLabel>
                      <Popover
                        open={openCalendarTermStart}
                        onOpenChange={setOpenCalendarTermStart}
                      >
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full text-black"
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
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
                            fromYear={new Date().getFullYear() - 5}
                            toYear={new Date().getFullYear() + 5}
                            onDayClick={() => setOpenCalendarTermStart(false)}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Term End */}
                <FormField
                  control={form.control}
                  name="TermEnd"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-black font-bold text-xs">
                        Term End
                      </FormLabel>
                      <Popover
                        open={openCalendarTermEnd}
                        onOpenChange={setOpenCalendarTermEnd}
                      >
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full text-black"
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
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
                            fromYear={new Date().getFullYear() - 5}
                            toYear={new Date().getFullYear() + 5}
                            onDayClick={() => setOpenCalendarTermEnd(false)}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="submit" variant="default" className="px-4 py-2">
                Save Official
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
