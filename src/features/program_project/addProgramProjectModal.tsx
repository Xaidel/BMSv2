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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ProgramProject } from "@/types/apitypes";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { programProjectSchema } from "@/types/formSchema";
import { useAddProgramProject } from "../api/program_project/useAddProgramProject";

const selectOption: string[] = [
  "Program",
  "Project",
];

const statusOption = ["Planned", "Ongoing", "Completed", "Cancelled"] as const;

export default function AddProgramProjectModal() {
  const addMutation = useAddProgramProject();
  const queryClient = useQueryClient();

  const handleAdd = async (values: z.infer<typeof programProjectSchema>) => {
    toast.promise(addMutation.mutateAsync(values as ProgramProject), {
      loading: "Adding Program/Project please wait...",
      success: (data) => {
        const e = data.programProject;
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["program-projects"] });
        return {
          message: "Program/Project added successfully",
          description: `${e.Name} was added`,
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding Program/Project failed",
          description: `${error.error}`,
        };
      },
    });
  };
  const [openCalendarStart, setOpenCalendarStart] = useState(false);
  const [openCalendarEnd, setOpenCalendarEnd] = useState(false);
  const [openModal, setOpenModal] = useState(false);


  const form = useForm<z.infer<typeof programProjectSchema>>({
    resolver: zodResolver(programProjectSchema),
    defaultValues: {
      Name: "",
      Type: "Program",
      Description: "",
      StartDate: new Date(),
      EndDate: new Date(),
      Duration: 0,
      Location: "",
      Beneficiaries: "",
      Budget: 0,
      SourceOfFunds: "",
      ProjectManager: "",
      Status: "Planned",
    },
  });

  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Add Program/Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)}>
              <DialogHeader>
                <DialogTitle className="text-black">Create Program/Project</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Program/Project Information
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div>
                  <FormField
                    control={form.control}
                    name="Type"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel
                          htmlFor="Type"
                          className="text-black font-bold text-xs"
                        >
                          Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue
                                placeholder={"Please select the type"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectOption.map((option, i) => (
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
                <div>
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="Name"
                          className="text-black font-bold text-xs"
                        >
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Name"
                            type="text"
                            placeholder="Enter program/project name"
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
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="Description"
                          className="text-black font-bold text-xs"
                        >
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="Description"
                            placeholder="Enter description"
                            required
                            className="text-black"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="StartDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="StartDate"
                          className="text-black font-bold text-xs"
                        >
                          Start Date
                        </FormLabel>
                        <Popover
                          open={openCalendarStart}
                          onOpenChange={setOpenCalendarStart}
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
                                  <span>Pick a start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4  hover:text-white" />
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              onDayClick={() => setOpenCalendarStart(false)}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="EndDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="EndDate"
                          className="text-black font-bold text-xs"
                        >
                          End Date
                        </FormLabel>
                        <Popover
                          open={openCalendarEnd}
                          onOpenChange={setOpenCalendarEnd}
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
                                  <span>Pick an end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4  hover:text-white" />
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              onDayClick={() => setOpenCalendarEnd(false)}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="Location"
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                  <FormField
                    control={form.control}
                    name="Beneficiaries"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="Beneficiaries"
                          className="text-black font-bold text-xs"
                        >
                          Beneficiaries
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Beneficiaries"
                            type="text"
                            placeholder="Enter beneficiaries"
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
                    name="Budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="Budget"
                          className="text-black font-bold text-xs"
                        >
                          Budget
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Budget"
                            type="number"
                            min={0}
                            placeholder="Enter budget"
                            required
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
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
                    name="SourceOfFunds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="SourceOfFunds"
                          className="text-black font-bold text-xs"
                        >
                          Source of Funds
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="SourceOfFunds"
                            type="text"
                            placeholder="Enter source of funds"
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
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="ProjectManager"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="ProjectManager"
                          className="text-black font-bold text-xs"
                        >
                          Project Manager
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="ProjectManager"
                            type="text"
                            placeholder="Enter project manager"
                            required
                            {...field}
                            className="text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Status"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="Status"
                          className="text-black font-bold text-xs"
                        >
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue
                                placeholder={"Select status"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOption.map((option, i) => (
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
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Program/Project</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
