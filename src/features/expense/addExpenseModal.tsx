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
import { expenseSchema } from "@/types/formSchema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { Expense } from "@/types/apitypes";
import { useAddExpense } from "../api/expense/useAddExpense";

const selectOption = [
  "Infrastructure",
  "Honoraria",
  "Utilities",
  "Local Funds",
  "Foods",
  "IRA",
  "Others",
];

export default function AddExpenseModal() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const addMutation = useAddExpense();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      Type: "",
      Amount: 0,
      OR: "",
      PaidBy: "",
      PaidTo: "",
      Category: "",
      Date: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    toast.promise(addMutation.mutateAsync(values as unknown as Expense), {
      loading: "Adding Expense please wait...",
      success: (data) => {
        const e = data.expense;
        setOpenModal(false);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        return {
          message: "Expense added successfully",
          description: `${e.Type} was added`,
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: "Adding expense failed",
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
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-black">Create Expense</DialogTitle>
              <DialogDescription className="text-sm">
                All the fields are required unless it is mentioned otherwise
              </DialogDescription>
              <p className="text-md font-bold text-black">
                Basic Expense Information
              </p>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="Category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel
                      htmlFor="Category"
                      className="text-black font-bold text-xs"
                    >
                      Type
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full text-black border-black/15">
                          <SelectValue
                            className="text-black"
                            placeholder="Select a category"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectOption.map((option, i) => (
                            <SelectItem
                              className="text-black"
                              value={option}
                              key={i}
                            >
                              {option}
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
                name="Type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="Type"
                      className="text-black font-bold text-xs">
                      Expense Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="type_"
                        type="text"
                        placeholder="Enter expense name"
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
              <FormField
                control={form.control}
                name="PaidTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="PaidTo"
                      className="text-black font-bold text-xs"
                    >
                      Paid To
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="PaidTo"
                        type="text"
                        placeholder="Enter receiver"
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
                name="PaidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="PaidBy"
                      className="text-black font-bold text-xs"
                    >
                      Paid By
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="PaidBy"
                        type="text"
                        placeholder="Enter sender"
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
                name="Date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="Date"
                      className="text-black font-bold text-xs"
                    >
                      Date of Expense
                    </FormLabel>
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                      <FormControl>
                        <PopoverTrigger
                          asChild
                          className="w-full text-black hover:bg-primary hover:text-white"
                        >
                          <Button variant="outline">
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
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
                          onDayClick={() => setOpenCalendar(false)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Save Expense</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
