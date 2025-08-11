import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { useState } from "react";
import { toast } from "sonner";
import { invoke } from '@tauri-apps/api/core'
import { expenseSchema } from "@/types/formSchema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function AddExpenseModal({ onSave }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type_: "",
      amount: 0,
      or_number: 0,
      paid_to: "",
      paid_by: "",
      category: "",
      date: undefined,
    }
  })

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    try {
      await invoke("insert_expense_command", {
        expense: {
          ...values,
          date: values.date.toISOString(), // must be string for Rust
        },
      });

      toast.success("Expense added successfully", {
        description: `${values.type_} was added.`,
      });

      setOpenModal(false);
      form.reset();
      onSave(); // refresh the data in parent
    } catch (err) {
      console.error("Insert expense failed:", err);
      toast.error("Failed to add expense");
    }
  }

  return (
    <>
      <Dialog
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <DialogTrigger asChild>
          <Button size="lg" >
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
                <p className="text-md font-bold text-black">Basic Expense Information</p>
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
              {/* Type */}
                <div>
                  <FormField
                    control={form.control}
                    name="type_"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="type" className="text-black font-bold text-xs">Expense Name</FormLabel>
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
                </div>
                {/* Amount */}
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
                <div>
                  <FormField
                    control={form.control}
                    name="paid_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="paid_to" className="text-black font-bold text-xs">Paid To</FormLabel>
                        <FormControl>
                          <Input
                            id="paid_to"
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
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="paid_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="paid_by" className="text-black font-bold text-xs">Paid By</FormLabel>
                        <FormControl>
                          <Input
                            id="paid_by"
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
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="date" className="text-black font-bold text-xs">Date of Expense</FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <FormControl>
                            <PopoverTrigger asChild className="w-full text-black hover:bg-primary hover:text-white">
                              <Button
                                variant="outline"
                              >
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
                <Button type="submit">Save Expense</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog >
    </>
  )
}
