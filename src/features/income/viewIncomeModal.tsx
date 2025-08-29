import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema } from "@/types/formSchema";
import { z } from "zod";
import { CalendarIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Income } from "@/types/apitypes";
import { useEditIncome } from "../api/income/useEditIncome";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

type ViewIncomeModalProps = {
  income: Income;
  open: boolean;
  onClose: () => void;
};

export default function ViewIncomeModal({income,open, onClose,}: ViewIncomeModalProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const { mutateAsync: editIncome } = useEditIncome();
  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      Category: income.Category,
      Type: income.Type,
      Amount: income.Amount,
      OR: income.OR,
      ReceivedFrom: income.ReceivedFrom,
      ReceivedBy: income.ReceivedBy,
      DateReceived:
        income.DateReceived instanceof Date
          ? income.DateReceived
          : new Date(income.DateReceived),
    },
  });

  async function onSubmit(values: z.infer<typeof incomeSchema>) {
    // Compare changed fields with original income
    const updatedFields: Partial<z.infer<typeof incomeSchema>> = {};
    if (values.Category !== income.Category)
      updatedFields.Category = values.Category;
    if (values.Type !== income.Type) updatedFields.Type = values.Type;
    if (values.Amount !== income.Amount) updatedFields.Amount = values.Amount;
    if (values.OR !== income.OR) updatedFields.OR = values.OR;
    if (values.ReceivedFrom !== income.ReceivedFrom)
      updatedFields.ReceivedFrom = values.ReceivedFrom;
    if (values.ReceivedBy !== income.ReceivedBy)
      updatedFields.ReceivedBy = values.ReceivedBy;
    // For DateReceived, compare as ISO string
    const origDate =
      income.DateReceived instanceof Date
        ? income.DateReceived
        : new Date(income.DateReceived);
    if (values.DateReceived.getTime() !== origDate.getTime()) {
      updatedFields.DateReceived = values.DateReceived;
    }
    // Prepare payload
    const payload = {
      ...updatedFields,
      ...(updatedFields.DateReceived
        ? { DateReceived: (updatedFields.DateReceived as Date).toISOString() }
        : {}),
    };
    // Use toast.promise to provide feedback
    await toast.promise(editIncome({ ID: income.ID, updated: payload }), {
      loading: "Updating income...",
      success: "Income updated successfully",
      error: "Failed to update income",
    });
    onClose();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button>
            <Eye />
            View More
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-black">Edit Income</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
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

                      <FormControl></FormControl>
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
                              e.target.value === ""
                                ? undefined
                                : +e.target.value
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
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Income</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
