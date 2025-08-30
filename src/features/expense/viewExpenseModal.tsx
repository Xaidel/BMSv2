import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { expenseSchema } from "@/types/formSchema";
import { useEditExpense } from "../api/expense/useEditExpense";
import { Expense } from "@/types/apitypes";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

const selectOption = [
  "Infrastructure",
  "Honoraria",
  "Utilities",
  "Local Funds",
  "Foods",
  "IRA",
  "Others",
];

export default function ViewExpenseModal({
  expense,
  open,
  onClose,
}: {
  expense: Expense;
  open: boolean;
  onClose: () => void;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  // const [openModal, setOpenModal] = useState(false)
  const queryClient = useQueryClient();
  const editMutation = useEditExpense();
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      Category: expense.Category,
      Type: expense.Type,
      Amount: expense.Amount,
      OR: expense.OR,
      PaidTo: expense.PaidTo,
      PaidBy: expense.PaidBy,
      Date:
        expense.Date instanceof Date ? expense.Date : new Date(expense.Date),
    },
  });

 

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    type ExpensePatch = Partial<
      Omit<z.infer<typeof expenseSchema>, "Date"> & { Date: string }
    >;

    const updated: ExpensePatch = {};
    (Object.keys(values) as (keyof ExpensePatch)[]).forEach((key) => {
      const formValue = values[key as keyof typeof values];
      let expenseValue = expense[key as keyof Expense];

      if (key === "Date" && typeof expenseValue === "string") {
        expenseValue = new Date(expenseValue) as any;
      }

      if (formValue !== expenseValue) {
        if (key === "Date" && formValue instanceof Date) {
          updated.Date = formValue.toISOString();
        } else {
          (updated as Record<string, unknown>)[key] = formValue;
        }
      }
    });
    toast.promise(editMutation.mutateAsync({ ID: expense.ID, updated }), {
      loading: "Editing new expense please wait...",
      success: (expense) => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        onClose();
        return {
          message: "Expense edited successfully",
          description: `${expense.Type} was edited`,
        };
      },
      error: (error: { error: string }) => {
        return {
          message: "Editing expense failed",
          description: `${error.error}`,
        };
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-black">View Expense</DialogTitle>
              <DialogDescription className="text-sm text-black">
                Please review and update the expense details below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              {/* Category */}
              <FormField
                control={form.control}
                name="Category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel
                      htmlFor="Category"
                      className="text-black font-bold text-xs"
                    >
                      Category
                    </FormLabel>

                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                      className="text-black font-bold text-xs"
                    >
                      Expense Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="Type"
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
                    <FormLabel
                      htmlFor="Amount"
                      className="text-black font-bold text-xs"
                    >
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="Amount"
                        type="number"
                        placeholder="Enter amount"
                        required
                        {...field}
                        className="text-black"
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel
                      htmlFor="or"
                      className="text-black font-bold text-xs"
                    >
                      OR#
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="OR"
                        type="text"
                        placeholder="Enter OR#"
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
                name="PaidTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="PaidTo"
                      className="text-black font-bold text-xs"
                    >
                      Paid From
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="PaidTo"
                        type="text"
                        placeholder="Enter Paid From"
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
                        placeholder="Enter Paid By"
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
                      htmlFor="date"
                      className="text-black font-bold text-xs"
                    >
                      Date
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
                          disabled={(date) => date < new Date()}
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
