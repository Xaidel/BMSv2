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
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { incomeSchema } from "@/types/formSchema";
import { useAddIncome } from "../api/income/useAddIncome";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { Income } from "@/types/apitypes";
import { toast } from "sonner";

// Category select options
const selectOption = [
  "Local Revenue",
  "Tax Revenue",
  "Water System",
  "Service Revenue",
  "Rental Income",
  "Government Funds",
  "Others",
];

export default function AddIncomeModal() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const addMutation = useAddIncome();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      Type: "",
      Amount: 0,
      OR: "",
      ReceivedBy: "",
      ReceivedFrom: "",
      Category: "",
      DateReceived: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof incomeSchema>) {
    console.log(values.Category);
    toast.promise(addMutation.mutateAsync(values as unknown as Income), {
      loading: "Adding Income please wait...",
      success: (data) => {
        const e = data.income;
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["incomes"] });
        return {
          message: "Income added successfully",
          description: `${e.Type} was added`,
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding income failed",
          description: `${error.error}`,
        };
      },
    });
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
                name="Category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel
                          htmlFor="Type"
                          className="text-black font-bold text-xs"
                        >
                          Type
                        </FormLabel>
                    
                      <FormControl>
                      </FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full text-black border-black/15">
                          <SelectValue className="text-black" placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectOption.map((option, i) => (
                            <SelectItem className="text-black" value={option} key={i}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Type */}
              <FormField
                control={form.control}
                name="Type"
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
                name="Amount"
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
                name="OR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      OR#
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter OR number"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : e.target.value
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
                name="ReceivedFrom"
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
                name="ReceivedBy"
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
                name="DateReceived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-bold text-xs">
                      Date Received
                    </FormLabel>
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
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
