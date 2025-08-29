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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

import { useAddResident } from "../api/resident/useAddResident";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { residentSchema } from "@/types/formSchema";

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated"];
const statusOption = ["Active", "Dead", "Missing", "Moved Out"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];
const educAttainment = [
  "Elementary Graduate",
  "Highschool Graduate",
  "Senior Highschool Graduate",
  "College Graduate",
  "Masteral Degree",
  "Doctorate Degree",
];

export default function AddResidentModal() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);

  /* useEffect(() => {
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
   }, []); */

  const form = useForm<z.infer<typeof residentSchema>>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      Firstname: "",
      Middlename: "",
      Lastname: "",
      Suffix: "",
      CivilStatus: "",
      Status: "Active",
      Gender: "",
      MobileNumber: "",
      Birthday: new Date(),
      Birthplace: "",
      Nationality: "",
      Zone: 0,
      EducationalAttainment: "",
      Barangay: "",
      Town: "",
      Province: "",
      Image: null,
      IsVoter: false,
      IsPWD: false,
      IsSolo: false,
      IsSenior: false,
      Occupation: "",
      Religion: "",
      AvgIncome: 0,
    },
  });

  const addMutation = useAddResident();
  const queryClient = useQueryClient();

  const onSubmit = async (values: z.infer<typeof residentSchema>) => {
    toast.promise(
      addMutation.mutateAsync({
        Firstname: values.Firstname,
        Middlename: values.Middlename,
        Lastname: values.Lastname,
        CivilStatus: values.CivilStatus,
        Gender: values.Gender,
        Nationality: values.Nationality,
        Religion: values.Religion,
        Status: values.Status,
        Birthplace: values.Birthplace,
        EducationalAttainment: values.EducationalAttainment,
        Birthday: values.Birthday,
        IsVoter: values.IsVoter,
        IsPWD: values.IsPWD,
        Image: null,
        Zone: Number(values.Zone),
        Barangay: values.Barangay,
        Town: values.Town,
        Province: values.Province,
        Suffix: values.Suffix,
        Occupation: values.Occupation,
        AvgIncome: values.AvgIncome,
        MobileNumber: values.MobileNumber,
        IsSolo: false,
        IsSenior: false,
      }),
      {
        loading: "Adding Resident please wait...",
        success: (data) => {
          const r = data.resident;
          queryClient.invalidateQueries({ queryKey: ["residents"] });
          setOpenModal(false);
          return {
            message: "Resident Added successfully",
            description: `${r.Firstname} ${r.Lastname} was added`,
          };
        },
        error: (error: ErrorResponse) => {
          return {
            message: "Adding resident failed",
            description: `${error.error}`,
          };
        },
      }
    );
  };

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

            {step === 1 && (
              <>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Personal Information
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="Image"
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
                                    reader.onload = () => {};
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="mt-2 bg-gray-400 text-white file:bg-gray-400 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1"
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
                      name="Firstname"
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
                      name="Middlename"
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
                      name="Lastname"
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

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="Suffix"
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
                      name="CivilStatus"
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

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="Gender"
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
                      name="Nationality"
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
                      name="MobileNumber"
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
                      name="Religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <FormControl>
                            <Input
                              id="religion"
                              type="text"
                              placeholder="Enter Religion"
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
                      name="Birthday"
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
                                disabled={(date) => date > new Date()}
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
                      name="EducationalAttainment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educational Attainment</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Education Attainment" />
                              </SelectTrigger>
                              <SelectContent>
                                {educAttainment.map((option) => (
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
                      name="Status"
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
                <div className="col-span-4 grid grid-cols-4 gap-1 mt-4">
                  <FormField
                    control={form.control}
                    name="IsVoter"
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
                        <FormLabel className="text-black">Voter</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="IsPWD"
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
                    name="IsSenior"
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
                        <FormLabel className="text-black">Senior</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="IsSolo"
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
                        <FormLabel className="text-black">
                          Solo Parent
                        </FormLabel>
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
                      name="Birthplace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthplace</FormLabel>
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
                </div>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Present Address
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="Zone"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel
                            htmlFor="zone"
                            className="text-black font-bold text-xs"
                          >
                            Zone
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            // defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full text-black border-black/15">
                                <SelectValue placeholder="Select zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["1", "2", "3", "4", "5", "6", "7", "8"].map(
                                (option, i) => (
                                  <SelectItem value={option} key={i}>
                                    {option}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="Barangay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barangay</FormLabel>
                          <FormControl>
                            <Input
                              id="Barangay"
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
                      name="Town"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City/Town</FormLabel>
                          <FormControl>
                            <Input
                              id="Town"
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
                      name="Province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Input
                              id="Province"
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
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Employment Information
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="Occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input
                              id="Occupation"
                              type="text"
                              placeholder="Enter Occupation"
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
                      name="AvgIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Income</FormLabel>
                          <FormControl>
                            <Input
                              id="AvgIncome"
                              type="number"
                              placeholder="Enter Estimated Income"
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
