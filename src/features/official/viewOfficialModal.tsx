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

import editOfficial from "@/service/api/official/editOfficial";
import { useDeleteOfficial } from "../api/official/useDeleteOfficial";

export default function ViewOfficialModal({ person, onClose }) {
  const [imagePreview, setImagePreview] = useState(person?.image || "");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      Name: person?.Name || "",
      Role: person?.Role || "",
      Section: person?.Section || "",
      Age: person?.Age ? String(person.Age) : "",
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

  const onSubmit = async (values) => {
    const updatedFields: Partial<typeof values> = {};

    if (values.Name !== person.Name) updatedFields.Name = values.Name;
    if (values.Role !== person.Role) updatedFields.Role = values.Role;
    if (values.Section !== person.Section)
      updatedFields.Section = values.Section;
    if (values.Age !== (person.Age ? String(person.Age) : ""))
      updatedFields.Age = values.Age ? parseInt(values.Age) : person.Age;
    if (values.Contact !== person.Contact)
      updatedFields.Contact = values.Contact;
    if (values.Zone !== person.Zone) updatedFields.Zone = values.Zone;
    if (values.Image !== person.Image) updatedFields.Image = values.Image;

    if (
      (values.TermStart &&
        (!person.TermStart ||
          new Date(values.TermStart).toISOString() !== person.TermStart)) ||
      (!values.TermStart && person.TermStart)
    )
      updatedFields.TermStart = values.TermStart
        ? new Date(values.TermStart)
        : person.TermStart;

    if (
      (values.TermEnd &&
        (!person.TermEnd ||
          new Date(values.TermEnd).toISOString() !== person.TermEnd)) ||
      (!values.TermEnd && person.TermEnd)
    )
      updatedFields.TermEnd = values.TermEnd
        ? new Date(values.TermEnd)
        : person.TermEnd;

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    const payload = { ...updatedFields };

    toast.promise(editOfficial(person.ID, payload), {
      loading: "Updating official...",
      success: "Official updated successfully",
      error: "Failed to update official",
    });


  };

  const handleReset = () => {
    form.reset({
      Name: "",
      Role: "",
      Section: "",
      Age: "",
      Contact: "",
      TermStart: null,
      TermEnd: null,
      Zone: "",
      Image: "",
    });
    setImagePreview("");
  };

  // Role, section dropdown options (match AddOfficialModal)
  const sectionOptions = [
    { value: "Barangay Officials", label: "Barangay Officials" },
    { value: "SK Officials", label: "SK Officials" },
    { value: "Tanod Officials", label: "Tanod Officials" },
  ];

  return (
    <Dialog open={!!person} onOpenChange={onClose}>
      <DialogContent className="text-black max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Official Info</DialogTitle>
          <DialogDescription>
            View and update the official’s profile information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="text-center text-black space-y-4"
          >
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
                        placeholder="Age"
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
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-4 py-2"
              >
                Reset
              </Button>
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
