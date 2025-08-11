import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema } from "@/types/formSchema";
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
import { invoke } from "@tauri-apps/api/core";

type ViewPropsIncome = {
  id?: number;
  type_: string;
  amount: number;
  or_number: number;
  received_from: string;
  received_by: string;
  date: Date;
  category: string;
  onSave: () => void;
};

export default function ViewIncomeModal(props: ViewPropsIncome) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      type_: props.type_,
      amount: props.amount,
      or_number: props.or_number,
      received_from: props.received_from,
      received_by: props.received_by,
      date: props.date,
      category: props.category,
    },
  });

  async function onSubmit(values: z.infer<typeof incomeSchema>) {
    try {
      const incomeWithId = {
        ...values,
        id: props.id,
        date: values.date.toISOString(), // ensure date is formatted
      };

      await invoke("save_income_command", { income: incomeWithId });

      toast.success("Income updated successfully", {
        description: `${values.type_} was updated.`,
      });

      setOpenModal(false);
      props.onSave();
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
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
                <DialogTitle className="text-black">Create Income</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">
                  Basic Income Information
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
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
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Honoraria">Honoraria</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Local Funds">Local Funds</option>
                          <option value="Foods">Foods</option>
                          <option value="IRA">IRA</option>
                          <option value="Others">Others</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormField
                    control={form.control}
                    name="type_"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="type"
                          className="text-black font-bold text-xs"
                        >
                          Income
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="type_"
                            type="text"
                            placeholder="Enter Income name"
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
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="amount"
                          className="text-black font-bold text-xs"
                        >
                          Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="amount"
                            type="text"
                            placeholder="Enter OR#"
                            required
                            {...field}
                            className="text-black"
                            onChange={(e) => field.onChange(+e.target.value)}
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
                    name="or_number"
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
                            id="or_number"
                            type="text"
                            placeholder="Enter OR#"
                            required
                            {...field}
                            className="text-black"
                            onChange={(e) => field.onChange(+e.target.value)}
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
                    name="received_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="received_from"
                          className="text-black font-bold text-xs"
                        >
                          Received From
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="received_from"
                            type="text"
                            placeholder="Enter Received From"
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
                    name="received_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="received_by"
                          className="text-black font-bold text-xs"
                        >
                          Received By
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="received_by"
                            type="text"
                            placeholder="Enter Received By"
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
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="date"
                          className="text-black font-bold text-xs"
                        >
                          Date Issued
                        </FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
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
