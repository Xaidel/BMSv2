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
import { Resident } from "@/types/apitypes";
import { useEditResident } from "../api/resident/useEditResident";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated"];
const statusOption = ["Active", "Dead", "Missing", "Moved Out"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];
const educAttainment = ["Elementary Graduate", "Highschool Graduate", "Senior Highschool Graduate", "College Graduate", "Masteral Degree", "Doctorate Degree"]

export default function ViewResidentModal(
  { resident, open, onClose }: { resident: Resident, open: boolean, onClose: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof residentSchema>>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      first_name: resident.Firstname,
      middle_name: resident.Middlename || "",
      last_name: resident.Lastname,
      suffix: resident.Suffix,
      civil_status: resident.CivilStatus,
      gender: resident.Gender,
      nationality: resident.Nationality,
      occupation: resident.Occupation,
      mobile_number: resident.MobileNumber,
      date_of_birth: resident.Birthday,
      town_of_birth: resident.Birthplace,
      zone: resident.Zone.toString(),
      educAttainment: resident.EducationalAttainment,
      religion: resident.Religion,
      barangay: resident.Barangay,
      town: resident.Town,
      province: resident.Province,
      status: resident.Status,
      photo: resident.Image,
      is_registered_voter: resident.IsVoter,
      is_pwd: resident.IsPWD,
      income: resident.AvgIncome
    },
  });

  const editMutation = useEditResident()
  const queryClient = useQueryClient()
  async function onSubmit(values: z.infer<typeof residentSchema>) {

    const updated: Partial<Record<keyof Resident, any>> = {}

    const keyMap: Record<string, keyof Resident> = {
      first_name: "Firstname",
      middle_name: "Middlename",
      last_name: "Lastname",
      suffix: "Suffix",
      civil_status: "CivilStatus",
      gender: "Gender",
      nationality: "Nationality",
      occupation: "Occupation",
      mobile_number: "MobileNumber",
      date_of_birth: "Birthday",
      town_of_birth: "Birthplace",
      zone: "Zone",
      educAttainment: "EducationalAttainment",
      religion: "Religion",
      barangay: "Barangay",
      town: "Town",
      province: "Province",
      status: "Status",
      photo: "Image",
      is_registered_voter: "IsVoter",
      is_pwd: "IsPWD",
      income: "AvgIncome",
    }

    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values]
      const residentKey = keyMap[key]

      if (!residentKey) return

      const residentValue = resident[residentKey]

      if (formValue !== residentValue) {
        // ✅ Special case for date_of_birth -> format as YYYY-MM-DD
        if (key === "date_of_birth" && formValue instanceof Date) {
          updated[residentKey] = formValue.toISOString().split("T")[0] // "2002-08-03"
        } else {
          updated[residentKey] = formValue as any
        }
      }
    })

    toast.promise(
      editMutation.mutateAsync({ resident_id: resident.ID, updated }), {
      loading: "Editing residents please wait...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["residents"] })
        onClose()
        return {
          message: "Resident edited successfully"
        }
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing resident failed",
          description: `${error.error}`
        }
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
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

                    <div className="col-span-2">
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

                    <div className="col-span-2">
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
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="educAttainment"
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
                        name="religion"
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
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input
                                id="occupation"
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
                        name="income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Income</FormLabel>
                            <FormControl>
                              <Input
                                id="income"
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
                    <Button type="submit">Save Resident</Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
