import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { residentSchema } from "@/types/formSchema";
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
import { invoke } from "@tauri-apps/api/core";
import { Resident } from "@/types/types";

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated"];
const statusOption = ["Active", "Dead", "Missing", "Moved Out"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];
const prefixOptions = ["Mr.", "Mrs.", "Ms."];


export default function ViewResidentModal(
  props: Resident & { onSave: () => void }
) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  console.log(capturedImage)
  const form = useForm<z.infer<typeof residentSchema>>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      ...props,
      date_of_birth: props.date_of_birth
        ? new Date(props.date_of_birth)
        : undefined,
    },
  });


  async function onSubmit(values: z.infer<typeof residentSchema>) {
    try {
      const residentWithId = {
        ...values,
        id: props.id,
        date_of_birth:
          values.date_of_birth instanceof Date
            ? values.date_of_birth.toISOString().split("T")[0]
            : values.date_of_birth,
      };

      await invoke("update_resident_command", { resident: residentWithId });

      toast.success("Resident updated successfully", {
        description: `${values.first_name} ${values.last_name} was updated.`,
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
        <DialogContent className="text-black bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-black">
                  View More Details
                </DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Resident Information
                </p>
              </DialogHeader>

              {/* Rest of your content here... */}
              <div className="flex flex-col gap-3">
                {step === 1 && (
                  <>
                    <h2 className="text-md font-semibold text-gray-900 mt-2">
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="prefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Prefix" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {prefixOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="photo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Upload Profile Picture</FormLabel>
                              <FormControl>
                                <>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        field.onChange(file);
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          setCapturedImage(
                                            reader.result as string
                                          );
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="mt-2"
                                  />
                                </>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="first_name"
                                  type="text"
                                  placeholder="Enter first name"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="middle_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Middle Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="middle_name"
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

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="last_name"
                                  type="text"
                                  placeholder="Enter last name"
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
                          name="suffix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suffix</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Suffix" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {suffixOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="civil_status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Civil Status</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Civil Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {civilStatusOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {genderOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="nationality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationality</FormLabel>
                              <FormControl>
                                <Input
                                  id="nationality"
                                  type="text"
                                  placeholder="Enter nationality"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="mobile_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  id="mobileNumber"
                                  type="text"
                                  placeholder="Enter mobile number"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="date_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
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
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOption.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-md font-semibold text-gray-900 mt-2">
                      Place of Birth
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="town_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City/Town</FormLabel>
                              <FormControl>
                                <Input
                                  id="townOfBirth"
                                  type="text"
                                  placeholder="Enter town/city of birth"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="province_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <FormControl>
                                <Input
                                  id="provinceOfBirth"
                                  type="text"
                                  placeholder="Enter province of birth"
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
                    <h2 className="text-md font-semibold text-gray-900 mt-2">
                      Present Address
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="zone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zone/Purok</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="w-full text-black border-black/15">
                                    <SelectValue placeholder={"Please select the zone"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["1", "2", "3", "4", "5", "6", "7"].map((option, i) => (
                                      <SelectItem value={option} key={i}>{option}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="barangay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Barangay</FormLabel>
                              <FormControl>
                                <Input
                                  id="barangay"
                                  type="text"
                                  placeholder="Enter present barangay"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="town"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Town</FormLabel>
                              <FormControl>
                                <Input
                                  id="town"
                                  type="text"
                                  placeholder="Enter present town"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <FormControl>
                                <Input
                                  id="province"
                                  type="text"
                                  placeholder="Enter present province"
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
                  </>
                )}
                {step === 3 && (
                  <>
                    <h2 className="text-md font-semibold text-gray-900 mt-2">
                      Family Information
                    </h2>
                    <h2 className="text-sm font-semibold text-gray-700 mt-2">
                      Name of Father
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name="father_prefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Prefix" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {prefixOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="father_first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="father_firstName"
                                  type="text"
                                  placeholder="Enter first name"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="father_middle_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Middle Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="father_middleName"
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

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="father_last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="father_last_name"
                                  type="text"
                                  placeholder="Enter last name"
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
                          name="father_suffix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suffix</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Suffix" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {suffixOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold text-gray-700 mt-2">
                      Name of Mother
                    </h2>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name="mother_prefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Prefix" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {prefixOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="mother_first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="mother_firstName"
                                  type="text"
                                  placeholder="Enter first name"
                                  required
                                  {...field}
                                  className="text-black"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="mother_middle_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Middle Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="mothermiddleName"
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

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="mother_last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="mother_last_name"
                                  type="text"
                                  placeholder="Enter last name"
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
                  {step < 3 && (
                    <Button
                      type="button"
                      onClick={() => setStep((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  )}
                  {step === 3 && <Button type="submit">Save Blotter</Button>}
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
