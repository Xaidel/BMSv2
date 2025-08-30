import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Feature } from "geojson";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const establishmentSchema = z.object({
  type: z.enum(["household", "business", "establishment"], {
    required_error: "Type is required",
  }),
  householdNumber: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessOwner: z.string().optional(),
  operationDate: z
    .date({ required_error: "Operation date is required" })
    .optional(),
  householdHead: z.string().optional(),
  establishmentName: z.string().optional(),
  establishmentHead: z.string().optional(),
});

type EstablishmentForm = z.infer<typeof establishmentSchema>;

export default function AddMappingModal({
  feature,
  dialogOpen,
  onOpenChange,
}: {
  feature: Feature;
  dialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [openModal, setOpenModal] = useState(dialogOpen);
  const [openCalendar, setOpenCalendar] = useState(false);

  // Sync modal state with prop
  // (This ensures the modal follows the parent open/close)
  // eslint-disable-next-line
  if (openModal !== dialogOpen) setOpenModal(dialogOpen);

  const form = useForm<EstablishmentForm>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      type: "household",
      householdNumber: "",
      businessName: "",
      businessType: "",
      businessOwner: "",
      operationDate: undefined,
      householdHead: "",
    },
  });

  const type = form.watch("type");

  function onSubmit(values: EstablishmentForm) {
    // TODO: handle submit logic
    // For now, just close the modal
    onOpenChange(false);
    setOpenModal(false);
  }

  return (
    <Dialog open={openModal} onOpenChange={onOpenChange}>
      <DialogContent className="text-black max-w-md">
        <DialogTitle>Barangay Tambo Mapping</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-2"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Building</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="household">Household</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="establishment">Establishment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional fields */}
            {type === "household" && (
              <FormField
                control={form.control}
                name="householdHead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household Head/Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search or enter household head/number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === "business" && (
              <>
                <FormField
                  control={form.control}
                  name="householdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Household Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter household number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessOwner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Owner</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business owner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Operation Date</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={"w-full text-left font-normal"}
                          onClick={() => setOpenCalendar((open) => !open)}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </FormControl>
                      {openCalendar && (
                        <div className="z-50">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setOpenCalendar(false);
                            }}
                            initialFocus
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {type === "establishment" && (
              <>
                <FormField
                  control={form.control}
                  name="establishmentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Establishment</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name of establishment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="establishmentHead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head of Establishment</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter head of establishment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary text-white">
                Save Establishment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
