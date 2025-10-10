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
import { useAddYouth } from "../api/youth/useAddYouth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { youthSchema } from "@/types/formSchema";


const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Lived-In"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];

const educBackgroundOptions = [
  "Elementary Level",
  "Elementary Grad",
  "High School Level",
  "High School Grad",
  "Vocational Grad",
  "College Level",
  "College Grad",
];

const workStatusOptions = [
  "Employed",
  "Unemployed",
  "Self-Employed",
  "Currently looking for a job",
  "Not interested looking for a job",
];

const ageGroupOptions = [
  { label: "Child Youth (15-17 yrs old)", value: "Child Youth" },
  { label: "Core Youth (18-24 yrs old)", value: "Core Youth" },
  { label: "Young Adult (25-30 yrs old)", value: "Young Adult" },
];

export default function AddYouthModal() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);
  
  const form = useForm<z.infer<typeof youthSchema>>({
    resolver: zodResolver(youthSchema),
    defaultValues: {
      Firstname: "",
      Middlename: "",
      Lastname: "",
      Suffix: "",
      CivilStatus: "",
      Gender: "",
      Birthday: new Date(),
      Zone: 0,
      Address: "",
      Image: null,
      EmailAddress: "",
      ContactNumber: "",
      EducationalBackground: "",
      WorkStatus: "",
      IsSKVoter: false,
      InSchoolYouth: false,
      OutOfSchoolYouth: false,
      WorkingYouth: false,
      YouthWithSpecificNeeds: false,
      AgeGroup: "",
    },
  });

  // No need to set Barangay, Town, Province, as they're not in Youth type anymore

  const addMutation = useAddYouth();
  const queryClient = useQueryClient();

  const onSubmit = async (values: z.infer<typeof youthSchema>) => {
    toast.promise(
      addMutation.mutateAsync({
        Firstname: values.Firstname,
        Middlename: values.Middlename,
        Lastname: values.Lastname,
        Suffix: values.Suffix,
        CivilStatus: values.CivilStatus,
        Gender: values.Gender,
        Birthday: new Date(values.Birthday.toISOString().split("T")[0]),
        Zone: Number(values.Zone),
        Image: null,
        EmailAddress: values.EmailAddress,
        ContactNumber: values.ContactNumber,
        EducationalBackground: values.EducationalBackground,
        WorkStatus: values.WorkStatus,
        IsSKVoter: values.IsSKVoter,
        InSchoolYouth: values.InSchoolYouth,
        OutOfSchoolYouth: values.OutOfSchoolYouth,
        WorkingYouth: values.WorkingYouth,
        YouthWithSpecificNeeds: values.YouthWithSpecificNeeds,
        AgeGroup: values.AgeGroup,
      }),
      {
        loading: "Adding Youth please wait...",
        success: (data) => {
          const r = data.youth;
          queryClient.invalidateQueries({ queryKey: ["youths"] });
          setOpenModal(false);
          return {
            message: "Youth Added successfully",
            description: `${r.Firstname} ${r.Lastname} was added`,
          };
        },
        error: (error: ErrorResponse) => {
          console.log(error)
          return {
            message: "Adding youth failed",
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
          <Plus /> Add Youth
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto text-black">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Youth Information</DialogTitle>
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
                      name="ContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Contact Number ({field.value?.length || 0}/11)
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="contactNumber"
                              type="text"
                              placeholder="Enter contact number"
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
                      name="EmailAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              id="emailAddress"
                              type="email"
                              placeholder="Enter email address"
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
                                onSelect={(date) => {
                                  field.onChange(date);
                                  if (date) {
                                    const age = new Date().getFullYear() - date.getFullYear();
                                  let group: "" | "Child Youth" | "Core Youth" | "Young Adult" = "";
                                    if (age >= 15 && age <= 17) group = "Child Youth";
                                    else if (age >= 18 && age <= 24) group = "Core Youth";
                                    else if (age >= 25 && age <= 30) group = "Young Adult";
                                    form.setValue("AgeGroup", group);
                                  }
                                }}
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
                      name="AgeGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Age Group" />
                              </SelectTrigger>
                              <SelectContent>
                                {ageGroupOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
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
                <div className="col-span-4 grid grid-cols-2 gap-1 mt-4">
                  <FormField
                    control={form.control}
                    name="IsSKVoter"
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
                        <FormLabel className="text-black">SK Voter</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="InSchoolYouth"
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
                        <FormLabel className="text-black">In-School Youth</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="OutOfSchoolYouth"
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
                        <FormLabel className="text-black">Out-of-School Youth</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="WorkingYouth"
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
                          Working Youth
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="YouthWithSpecificNeeds"
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
                          Youth with Specific Needs
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
                      name="Address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              id="Address"
                              type="text"
                              placeholder="Enter present address"
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
                  Work Information
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="WorkStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Work Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {workStatusOptions.map((option) => (
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
                      name="EducationalBackground"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educational Background</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Educational Background" />
                              </SelectTrigger>
                              <SelectContent>
                                {educBackgroundOptions.map((option) => (
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
                <div className="flex justify-between pt-4">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Save Youth</Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
