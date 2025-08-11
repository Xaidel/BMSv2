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
import { settingsSchema } from "@/types/formSchema";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { residentSchema } from "@/types/formSchema";

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated"];
const statusOption = ["Active", "Dead", "Missing", "Moved Out"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];
const prefixOptions = ["Mr.", "Mrs.", "Ms."];

export default function AddResidentModal({ onSave }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function loadDefaultLocation() {
      try {
        const settings = await invoke("fetch_settings_command") as z.infer<typeof settingsSchema>;
        if (settings) {
          form.setValue("barangay", settings.barangay || "");
          form.setValue("town", settings.municipality || "");
          form.setValue("province", settings.province || "");
        }
      } catch (error) {
        console.error("Failed to load default location from settings:", error);
      }
    }

    loadDefaultLocation();
  }, []);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof residentSchema>>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      prefix: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      civil_status: "",
      status: "",
      gender: "",
      mobile_number: "",
      date_of_birth: undefined,
      town_of_birth: "",
      province_of_birth: "",
      nationality: "",
      zone: "",
      barangay: "",
      town: "",
      province: "",
      father_suffix: "",
      father_first_name: "",
      father_middle_name: "",
      father_last_name: "",
      father_prefix: "",
      mother_prefix: "",
      mother_first_name: "",
      mother_middle_name: "",
      mother_last_name: "",
      photo: null,
      is_registered_voter: false,
      is_pwd: false,
      is_senior: false,
    },
  });

  async function onSubmit(values: z.infer<typeof residentSchema>) {
    try {
      await invoke("insert_resident_command", {
        resident: {
          ...values,
          photo: capturedImage || "",
          dateOfBirth: values.date_of_birth
            ? values.date_of_birth.toISOString().split("T")[0]
            : "",
        },
      });

      toast.success("Resident added successfully", {
        description: `${values.first_name} ${values.last_name}`,
      });

      setOpenModal(false);
      form.reset();
      onSave?.(); // trigger refresh if provided
    } catch (error) {
      console.error("Insert resident failed:", error);
      toast.error("Failed to add resident.");
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Add Resident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto text-black">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Resident Information</DialogTitle>
              <DialogDescription>
                All the fields are required unless it is mentioned otherwise
              </DialogDescription>
            </DialogHeader>

            {/* --- Your step-based fields go here (Step 1, 2, 3) --- */}
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
                                      setCapturedImage(reader.result as string);
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
                <div className="col-span-4 grid grid-cols-3 gap-4 mt-4">
  <FormField
    control={form.control}
    name="is_registered_voter"
    render={({ field }) => (
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <input
            type="checkbox"
            checked={field.value}
            onChange={field.onChange}
            className="mr-2"
          />
        </FormControl>
        <FormLabel className="text-black">Registered Voter</FormLabel>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="is_pwd"
    render={({ field }) => (
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <input
            type="checkbox"
            checked={field.value}
            onChange={field.onChange}
            className="mr-2"
          />
        </FormControl>
        <FormLabel className="text-black">PWD</FormLabel>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="is_senior"
    render={({ field }) => (
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <input
            type="checkbox"
            checked={field.value}
            onChange={field.onChange}
            className="mr-2"
          />
        </FormControl>
        <FormLabel className="text-black">Senior Citizen</FormLabel>
      </FormItem>
    )}
  />
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
                        <FormItem className="w-full">
                          <FormLabel htmlFor="zone" className="text-black font-bold text-xs">Zone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full text-black border-black/15">
                                <SelectValue placeholder="Select zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["1", "2", "3", "4", "5", "6", "7"].map((option, i) => (
                                <SelectItem value={option} key={i}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <FormLabel>City/Town</FormLabel>
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
                <div className="flex justify-between pt-4">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Next
                  </Button>
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

                <div className="flex justify-between pt-4">
                  <Button type="button" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit">Save Resident</Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
