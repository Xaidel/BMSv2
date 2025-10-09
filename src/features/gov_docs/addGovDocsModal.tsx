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
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { govDocSchema } from "@/types/formSchema";
import { useAddGovDoc } from "../api/gov_docs/useAddGovDocs";

const selectOption: string[] = [
  "Executive Order",
  "Resolution",
  "Ordinance",
];

export default function AddGovDocsModal() {
  const addMutation = useAddGovDoc();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof govDocSchema>>({
    resolver: zodResolver(govDocSchema),
    defaultValues: {
      Title: "",
      Type: "Executive Order",
      Description: "",
      DateIssued: new Date(),
      Image: undefined,
    },
  });

  const handleAdd = async (values: z.infer<typeof govDocSchema>) => {
    // Prepare form data if image is present
    const formData = new FormData();
    formData.append("Title", values.Title);
    formData.append("Type", values.Type);
    formData.append("Description", values.Description);
    formData.append("DateIssued", format(values.DateIssued, "yyyy-MM-dd"));
    if (imageFile) {
      formData.append("Image", imageFile.name);
    }

    toast.promise(addMutation.mutateAsync(formData as any), {
      loading: "Adding Government Document please wait...",
      success: (data) => {
        const e = data.gov_doc;
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["govdocs"] });
        return {
          message: "Government Document added successfully",
          description: `${e.Title} was added`,
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding Government Document failed",
          description: `${error.error}`,
        };
      },
    });
  };

  const [openCalendarIssued, setOpenCalendarIssued] = useState(false);

  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Add Document
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAdd)}
              encType="multipart/form-data"
            >
              <DialogHeader>
                <DialogTitle className="text-black">
                  Create Government Document
                </DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Government Document Information
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
                              <SelectValue placeholder={"Please select the type"} />
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
                    name="Title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="Title"
                          className="text-black font-bold text-xs"
                        >
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="Title"
                            type="text"
                            placeholder="Enter government document title"
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
                <div>
                  <FormField
                    control={form.control}
                    name="DateIssued"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="DateIssued"
                          className="text-black font-bold text-xs"
                        >
                          Date Issued
                        </FormLabel>
                        <Popover
                          open={openCalendarIssued}
                          onOpenChange={setOpenCalendarIssued}
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
                                  <span>Pick date issued</span>
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
                              onDayClick={() => setOpenCalendarIssued(false)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormLabel
                    htmlFor="Image"
                    className="text-black font-bold text-xs"
                  >
                    Upload Image
                  </FormLabel>
                  <Input
                    id="Image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="text-black"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Government Document</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
