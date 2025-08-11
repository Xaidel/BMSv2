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
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { incomeSchema } from "@/types/formSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function AddIncomeModal({ onSave }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      type_: "",
      amount: 0,
      or_number: 0,
      received_from: "",
      received_by: "",
      category: "",
      date: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof incomeSchema>) {
    try {
      await invoke("insert_income_command", {
        income: {
          ...values,
          date: values.date.toISOString(), // must be string for Rust
        },
      });

      toast.success("Income added successfully", {
        description: `${values.type_} was added.`,
      });

      setOpenModal(false);
      form.reset();
      onSave(); // refresh the data in parent
    } catch (err) {
      console.error("Insert income failed:", err);
      toast.error("Failed to add income");
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-black">Create Income</DialogTitle>
              <DialogDescription className="text-sm">
                All the fields are required unless otherwise mentioned
              </DialogDescription>
              <p className="text-md font-bold text-black">
                Basic Income Information
              </p>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Category
                    </FormLabel>
                    <FormControl>
                      <select
                        className="text-black border rounded p-2 w-full"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">Select category</option>
                        <option value="Local Revenue">Local Revenue</option>
                        <option value="Tax Revenue">Tax Revenue</option>
                        <option value="Government Grants">Government Grants</option>
                        <option value="Service Revenue">Service Revenue</option>
                        <option value="Rental Income">Rental Income</option>
                        <option value="Government Funds">Government Funds</option>
                        <option value="Others">Others</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Type */}
              <FormField
                control={form.control}
                name="type_"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Income Type
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter income type"
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : +e.target.value
                          )
                        }
                        value={field.value ?? ""}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="or_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      OR#
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : +e.target.value
                          )
                        }
                        value={field.value ?? ""}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Received From */}
              <FormField
                control={form.control}
                name="received_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Received From
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter payer/source"
                        className="text-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Received By */}
              <FormField
                control={form.control}
                name="received_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Received By
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter staff/receiver"
                        className="text-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Date Received
                    </FormLabel>
                    <Popover
                      open={openCalendar}
                      onOpenChange={setOpenCalendar}
                    >
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full text-black"
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          onDayClick={() => setOpenCalendar(false)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <Button type="submit">Save Income</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}