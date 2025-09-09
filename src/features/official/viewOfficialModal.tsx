import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditOfficial } from "../api/official/useEditOfficial";
import { useDeleteOfficial } from "../api/official/useDeleteOfficial";
import z from "zod";
import { officialSchema } from "@/types/formSchema";
import { Official } from "@/types/apitypes";

// Role, section dropdown options (match AddOfficialModal)
const sectionOptions = [
  { value: "Barangay Officials", label: "Barangay Officials" },
  { value: "SK Officials", label: "SK Officials" },
  { value: "Tanod Officials", label: "Tanod Officials" },
];
export default function ViewOfficialModal({
  official,
  person,
  open,
  onClose,
}: {
  official: Official;
  person: Official;
  open: boolean;
  onClose: () => void;
}) {
  const [imagePreview, setImagePreview] = useState(
    person?.Image || "/logoBarangay.png" || "/logoMunicipality.png"
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      Name: person?.Name || "",
      Role: person?.Role || "",
      Section: person?.Section || "",
      Age: person?.Age ?? 0,
      Contact: person?.Contact || "",
      TermStart: person?.TermStart ? new Date(person.TermStart) : null,
      TermEnd: person?.TermEnd ? new Date(person.TermEnd) : null,
      Zone: person?.Zone || "",
      Image: person?.Image || "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("Image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const editMutation = useEditOfficial();
  const deleteMutation = useDeleteOfficial();

  async function onSubmit(values: z.infer<typeof officialSchema>) {
    type OfficialPatch = Partial<
      Omit<z.infer<typeof officialSchema>, "TermStart" | "TermEnd"> & {
        TermStart: string;
        TermEnd: string;
      }
    >;

    const updated: OfficialPatch = {};
    Object.keys(values).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      let officialValue = official[key as keyof Official];

      // Remove special handling for "Date" (not used in officials)
      if (formValue !== officialValue) {
        if (
          (key === "TermStart" || key === "TermEnd") &&
          formValue instanceof Date
        ) {
          (updated as Record<string, unknown>)[key] = formValue.toISOString();
        } else {
          (updated as Record<string, unknown>)[key] = formValue;
        }
      }
    });
    toast.promise(editMutation.mutateAsync({ ID: official.ID, updated }), {
      loading: "Editing new official please wait...",
      success: (official) => {
        queryClient.invalidateQueries({ queryKey: ["officials"] });
        onClose();
        return {
          message: "Official edited successfully",
          description: `${official.Name} was edited`,
        };
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing official failed",
          description: `${error.error}`,
        };
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
      </DialogTrigger>
      <DialogContent className="text-black max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Official Info</DialogTitle>
          <DialogDescription>
            View and update the official’s profile information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center space-y-2">
              <img
                src={imagePreview}
                alt={form.watch("Name")}
                className="w-24 h-24 rounded-full mx-auto object-cover border"
              />
              <label className="block">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-40 h-10"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 text-left">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Full Name"
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Section
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full text-black border-black/15">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Role"
                render={({ field }) => {
                  // Updated sectionRoleMap as requested
                  const sectionRoleMap = {
                    "Barangay Officials": [
                      "Barangay Captain",
                      "Barangay Councilor",
                      "Secretary",
                      "Treasurer",
                      "Driver",
                      "Care Taker",
                    ],
                    "SK Officials": ["SK Chairman", "SK Councilor"],
                    "Tanod Officials": ["Chief Tanod", "Tanod Member"],
                  };

                  const selectedSection = form.watch("Section");
                  const roleOptions = sectionRoleMap[selectedSection] || [];

                  return (
                    <FormItem>
                      <FormLabel className="text-black font-bold text-xs">
                        Role
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="Age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Age"
                        type="number"
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contact Number"
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Assigned Zone
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Assigned Zone"
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="TermStart"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-black font-bold text-xs">
                        Term Start
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={
                              "w-full pl-3 text-left font-normal flex items-center gap-2 " +
                              (field.value
                                ? "text-black"
                                : "text-muted-foreground")
                            }
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value
                              ? format(field.value, "yyyy-MM-dd")
                              : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={2000}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="TermEnd"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-black font-bold text-xs">
                        Term End
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={
                              "w-full pl-3 text-left font-normal flex items-center gap-2 " +
                              (field.value
                                ? "text-black"
                                : "text-muted-foreground")
                            }
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value
                              ? format(field.value, "yyyy-MM-dd")
                              : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={2000}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Dialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="px-4 py-2"
                  >
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-black font-normal">
                      Official Deletion
                    </DialogTitle>
                    <DialogDescription className="text-sm font-bold">
                      This action cannot be undone once confirmed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-black text-lg font-bold">
                    Are you sure you want to delete this official?
                  </div>
                  <div className="flex w-full gap-3 justify-end">
                    <DialogClose asChild>
                      <Button variant="ghost" className="text-black">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          toast.promise(
                            deleteMutation.mutateAsync([person.ID], {
                              onSuccess: () => {
                                onClose();
                                queryClient.invalidateQueries({
                                  queryKey: ["officials"],
                                });
                              },
                            }),
                            {
                              loading: "Deleting official...",
                              success: "Official deleted successfully",
                              error: "Failed to delete official",
                            }
                          );
                        }}
                      >
                        Confirm Delete
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
              <Button type="submit" variant="default" className="px-4 py-2">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
