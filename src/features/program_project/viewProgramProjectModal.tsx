import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { programProjectSchema } from "@/types/formSchema";
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
import { Textarea } from "@/components/ui/textarea";
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
import { ProgramProject } from "@/types/apitypes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEditProgramProject } from "../api/program_project/useEditProgramProject";

const selectOption: string[] = [
  "Assembly",
  "Health and Social Services",
  "Disater Preparedness and Environmental",
  "Education and Skill Development",
  "Cultural, Recreational, and Sports",
  "Law Enforcement and Community Safety",
  "Humanitarian Assistance",
];

export default function ViewProgramProjectModal({
  programProject,
  open,
  onClose,
}: {
  programProject: ProgramProject;
  open: boolean;
  onClose: () => void;
}) {
  const [openStartCalendar, setOpenStartCalendar] = useState(false);
  const [openEndCalendar, setOpenEndCalendar] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof programProjectSchema>>({
    resolver: zodResolver(programProjectSchema),
    defaultValues: {
      Name: programProject.Name,
      Type: programProject.Type,
      Description: programProject.Description,
      StartDate:
        programProject.StartDate instanceof Date
          ? programProject.StartDate
          : new Date(programProject.StartDate),
      EndDate:
        programProject.EndDate instanceof Date
          ? programProject.EndDate
          : new Date(programProject.EndDate),
      Duration: programProject.Duration,
      Location: programProject.Location,
      Beneficiaries: programProject.Beneficiaries,
      Budget: programProject.Budget,
      SourceOfFunds: programProject.SourceOfFunds,
      ProjectManager: programProject.ProjectManager,
      Status: programProject.Status,
    },
  });

  const editMutation = useEditProgramProject();

  async function onSubmit(values: z.infer<typeof programProjectSchema>) {
    type ProgramProjectPatch = Partial<{
      Name: string;
      Type: string;
      Description: string;
      StartDate: string;
      EndDate: string;
      Duration: string;
      Location: string;
      Beneficiaries: string;
      Budget: string;
      SourceOfFunds: string;
      ProjectManager: string;
      Status: "Ongoing" | "Upcoming" | "Cancelled" | "Finished";
    }>;

    const updated: ProgramProjectPatch = {};
    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      let projectValue = programProject[key as keyof ProgramProject];

      if (
        (key === "StartDate" || key === "EndDate") &&
        typeof projectValue === "string"
      ) {
        projectValue = new Date(projectValue) as any;
      }

      if (formValue !== projectValue) {
        if (
          (key === "StartDate" || key === "EndDate") &&
          formValue instanceof Date
        ) {
          updated[key as "StartDate" | "EndDate"] = formValue.toISOString();
        } else if (key === "Duration") {
          updated["Duration"] = String(formValue);
        } else if (key === "Status") {
          // Map Planned -> Upcoming, Completed -> Finished, else as is
          let mappedStatus: "Ongoing" | "Upcoming" | "Cancelled" | "Finished";
          if (formValue === "Planned") {
            mappedStatus = "Upcoming";
          } else if (formValue === "Completed") {
            mappedStatus = "Finished";
          } else {
            mappedStatus = formValue as "Ongoing" | "Upcoming" | "Cancelled" | "Finished";
          }
          updated["Status"] = mappedStatus;
        } else {
          updated[key as keyof ProgramProjectPatch] = formValue as any;
        }
      }
    });
    toast.promise(editMutation.mutateAsync({ ID: programProject.ID, updated }), {
      loading: "Editing program/project please wait...",
      success: (project) => {
        queryClient.invalidateQueries({ queryKey: ["program-projects"] });
        onClose();
        return {
          message: "Program/Project edited successfully",
          description: `${project.Name} was edited`,
        };
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing program/project failed",
          description: `${error.error}`,
        };
      },
    });
  }
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button>
            <Eye />
            View Program/Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-black">
                  Program/Project Details
                </DialogTitle>
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
                          htmlFor="type"
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
                                placeholder={"Please select the program/project type"}
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
                          htmlFor="name"
                          className="text-black font-bold text-xs"
                        >
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="name"
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
                          htmlFor="description"
                          className="text-black font-bold text-xs"
                        >
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="description"
                            placeholder="Enter program/project description"
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
                          htmlFor="startDate"
                          className="text-black font-bold text-xs"
                        >
                          Start Date
                        </FormLabel>
                        <Popover
                          open={openStartCalendar}
                          onOpenChange={setOpenStartCalendar}
                        >
                          <FormControl>
                            <PopoverTrigger
                              asChild
                              className="w-full text-black hover:bg-primary hover:text-white"
                            >
                              <Button variant="outline" className="w-full">
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
                              onDayClick={() => setOpenStartCalendar(false)}
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
                          htmlFor="endDate"
                          className="text-black font-bold text-xs"
                        >
                          End Date
                        </FormLabel>
                        <Popover
                          open={openEndCalendar}
                          onOpenChange={setOpenEndCalendar}
                        >
                          <FormControl>
                            <PopoverTrigger
                              asChild
                              className="w-full text-black hover:bg-primary hover:text-white"
                            >
                              <Button variant="outline" className="w-full">
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
                              onDayClick={() => setOpenEndCalendar(false)}
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
                          htmlFor="location"
                          className="text-black font-bold text-xs"
                        >
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="location"
                            type="text"
                            placeholder="Enter location"
                            required
                            className="text-black"
                            {...field}
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
                          htmlFor="beneficiaries"
                          className="text-black font-bold text-xs"
                        >
                          Beneficiaries
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="beneficiaries"
                            type="text"
                            placeholder="Enter beneficiaries"
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
                <div>
                  <FormField
                    control={form.control}
                    name="Budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="budget"
                          className="text-black font-bold text-xs"
                        >
                          Budget
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="budget"
                            type="number"
                            placeholder="Enter budget"
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
                <div>
                  <FormField
                    control={form.control}
                    name="SourceOfFunds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="sourceOfFunds"
                          className="text-black font-bold text-xs"
                        >
                          Source of Funds
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="sourceOfFunds"
                            type="text"
                            placeholder="Enter source of funds"
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
                    name="ProjectManager"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel
                          htmlFor="projectManager"
                          className="text-black font-bold text-xs"
                        >
                          Project Manager
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="projectManager"
                            type="text"
                            placeholder="Enter project manager"
                            required
                            className="text-black"
                            {...field}
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
                          htmlFor="status"
                          className="text-black font-bold text-xs"
                        >
                          Status
                        </FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("Status", value as any);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
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
