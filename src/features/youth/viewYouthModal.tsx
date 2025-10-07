import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { youthSchema } from "@/types/formSchema";
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
import { Youth } from "@/types/apitypes";
import { useEditYouth } from "../api/youth/useEditYouth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Lived-In"];
const genderOptions = ["Male", "Female"];
const suffixOptions = ["Jr.", "Sr.", "II", "III"];
const educationalBackgroundOptions = [
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

export default function ViewYouthModal({
  youth,
  open,
  onClose,
}: {
  youth: Youth;
  open: boolean;
  onClose: () => void;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof youthSchema>>({
    resolver: zodResolver(youthSchema),
    defaultValues: {
      Firstname: youth.Firstname,
      Middlename: youth.Middlename || "",
      Lastname: youth.Lastname,
      CivilStatus: youth.CivilStatus,
      Gender: youth.Gender,
      Birthday: youth.Birthday,
      Zone: youth.Zone ?? 0,
      Suffix: youth.Suffix,
      Image: null,
      EmailAddress: youth.EmailAddress || "",
      ContactNumber: youth.ContactNumber || "",
      EducationalBackground: youth.EducationalBackground || "",
      WorkStatus: youth.WorkStatus || "",
      InSchoolYouth: youth.InSchoolYouth || false,
      OutOfSchoolYouth: youth.OutOfSchoolYouth || false,
      WorkingYouth: youth.WorkingYouth || false,
      YouthWithSpecificNeeds: youth.YouthWithSpecificNeeds || false,
      IsSKVoter: youth.IsSKVoter || false,
      Address: youth.Address || "",
    },
  });
  const editMutation = useEditYouth();
  const queryClient = useQueryClient();
  async function onSubmit(values: z.infer<typeof youthSchema>) {
    const updated: Partial<Record<keyof Youth, any>> = {};
    const keyMap: Record<string, keyof Youth> = {
      Firstname: "Firstname",
      Middlename: "Middlename",
      Lastname: "Lastname",
      Suffix: "Suffix",
      CivilStatus: "CivilStatus",
      Gender: "Gender",
      Birthday: "Birthday",
      Zone: "Zone",
      Image: "Image",
      EmailAddress: "EmailAddress",
      ContactNumber: "ContactNumber",
      EducationalBackground: "EducationalBackground",
      WorkStatus: "WorkStatus",
      InSchoolYouth: "InSchoolYouth",
      OutOfSchoolYouth: "OutOfSchoolYouth",
      WorkingYouth: "WorkingYouth",
      YouthWithSpecificNeeds: "YouthWithSpecificNeeds",
      IsSKVoter: "IsSKVoter",
      Address: "Address",
    };

    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      const youthKey = keyMap[key];

      if (!youthKey) return;

      const youthValue = youth[youthKey];

      if (formValue !== youthValue) {
        if (key === "Birthday" && formValue instanceof Date) {
          updated[youthKey] = format(formValue, "yyyy-MM-dd");
        } else {
          updated[youthKey] = formValue as any;
        }
      }
    });

    toast.promise(
      editMutation.mutateAsync({ youth_id: youth.ID, updated }),
      {
        loading: "Editing youth please wait...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["youth"] });
          onClose();
          return {
            message: "Youth edited successfully",
          };
        },
        error: (error: { error: string }) => {
          return {
            message: "Editing youth failed",
            description: `${error.error}`,
          };
        },
      }
    );
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
                <DialogTitle>View Youth Information</DialogTitle>
                <DialogDescription>
                  All fields are optional unless mentioned otherwise.
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
                                      reader.onload = () => { };
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
                        name="EmailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                id="email_address"
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
                        name="ContactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input
                                id="contact_number"
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
                        name="EducationalBackground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Educational Background</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Educational Background" />
                                </SelectTrigger>
                                <SelectContent>
                                  {educationalBackgroundOptions.map((option) => (
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
                        name="WorkStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
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
                  </div>
                  <div className="col-span-4 grid grid-cols-2 gap-1 mt-4">
                    <FormField
                      control={form.control}
                      name="InSchoolYouth"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                          </FormControl>
                          <FormLabel className="text-black">In School Youth</FormLabel>
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
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                          </FormControl>
                          <FormLabel className="text-black">Out of School Youth</FormLabel>
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
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                          </FormControl>
                          <FormLabel className="text-black">Working Youth</FormLabel>
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
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                          </FormControl>
                          <FormLabel className="text-black">Youth w/ Specific needs</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="IsSKVoter"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="mr-2"
                            />
                          </FormControl>
                          <FormLabel className="text-black">SK Voter</FormLabel>
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
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="Address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                id="address"
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
                              onValueChange={(val) => field.onChange(Number(val))}
                              value={String(field.value)}
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
    </>
  );
}
