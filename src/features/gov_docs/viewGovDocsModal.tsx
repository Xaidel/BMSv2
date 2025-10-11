import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { govDocSchema } from "@/types/formSchema";
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
import { GovDoc } from "@/types/apitypes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEditGovDocs } from "../api/gov_docs/useEditGovDocs";

const selectOption: string[] = [
  "Ordinance",
  "Resolution",
  "Memo",
  "Executive Order",
  "Other",
];

export default function ViewGovDocsModal({
  govDoc,
  open,
  onClose,
}: {
  govDoc: GovDoc;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof govDocSchema>>({
    resolver: zodResolver(govDocSchema),
    defaultValues: {
      Title: govDoc.Title,
      Type: govDoc.Type,
      Description: govDoc.Description,
      DateIssued:
        govDoc.DateIssued instanceof Date
          ? govDoc.DateIssued
          : new Date(govDoc.DateIssued),
      Image: govDoc.Image || "",
    },
  });

  const editMutation = useEditGovDocs();

  async function onSubmit(values: z.infer<typeof govDocSchema>) {
    type GovDocPatch = Partial<{
      Title: string;
      Type: "Executive Order" | "Resolution" | "Ordinance";
      Description: string;
      DateIssued: string;
      Image: string;
    }>;

    const updated: GovDocPatch = {};
    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      let docValue = govDoc[key as keyof GovDoc];

      if (key === "DateIssued" && typeof docValue === "string") {
        docValue = new Date(docValue) as any;
      }

      if (formValue !== docValue) {
        if (key === "DateIssued" && formValue instanceof Date) {
          updated[key as "DateIssued"] = formValue.toISOString();
        } else if (key === "Type") {
          updated[key as "Type"] = formValue as "Executive Order" | "Resolution" | "Ordinance";
        } else {
          updated[key as keyof GovDocPatch] = formValue as any;
        }
      }
    });
    toast.promise(editMutation.mutateAsync({ ID: govDoc.ID, updated }), {
      loading: "Editing government document, please wait...",
      success: (doc) => {
        queryClient.invalidateQueries({ queryKey: ["gov-docs"] });
        onClose();
        return {
          message: "Government Document edited successfully",
          description: `${doc.Title} was edited`,
        };
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing government document failed",
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
            View Government Document
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-black">
                  Government Document Details
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
                                placeholder={"Please select the document type"}
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
                    name="Title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="title"
                          className="text-black font-bold text-xs"
                        >
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="title"
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
                          htmlFor="description"
                          className="text-black font-bold text-xs"
                        >
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="description"
                            placeholder="Enter government document description"
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
                          htmlFor="dateIssued"
                          className="text-black font-bold text-xs"
                        >
                          Date Issued
                        </FormLabel>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger
                              asChild
                              className="w-full text-black hover:bg-primary hover:text-white"
                            >
                              <Button variant="outline" className="w-full">
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date issued</span>
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
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="Image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="image"
                          className="text-black font-bold text-xs"
                        >
                          Document Image
                        </FormLabel>
                        {field.value && (
                          <div className="mb-2">
                            <img
                              src={typeof field.value === "string" ? field.value : URL.createObjectURL(field.value)}
                              alt="Document Preview"
                              className="max-h-48 rounded border"
                            />
                          </div>
                        )}
                        {/* No upload, just display */}
                        <FormMessage />
                      </FormItem>
                    )}
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
