import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus, ChevronsUpDown, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { invoke } from '@tauri-apps/api/core'
import { householdSchema } from "@/types/formSchema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandInput, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Virtuoso } from "react-virtuoso";
import { cn } from "@/lib/utils";

const selectOption: string[] = ["Renter", "Owner"];

const zone: string[] = [
  "Zone 1",
  "Zone 2",
  "Zone 3",
  "Zone 4",
  "Zone 5",
  "Zone 6",
  "Zone 7",
]

const status: string[] = [
  "Active",
  "Moved Out"
]

export default function AddHouseholdModal({ onSave }: { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [residentSearch, setResidentSearch] = useState("");
  const [residentOptions, setResidentOptions] = useState<string[]>([]);
  // For head of household popover
  const [headOpen, setHeadOpen] = useState(false);
  const [headSearch, setHeadSearch] = useState("");
  const [allResidents, setAllResidents] = useState<{ label: string; value: string }[]>([]);

  const form = useForm<z.infer<typeof householdSchema>>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      household_number: 0,
      type_: "",
      members: 0,
      head: "",
      zone: "",
      date: undefined,
      status: ""
    }
  })

  // Fetch all residents for dropdowns (head, members)
  useEffect(() => {
    invoke("fetch_all_residents_command")
      .then((res) => {
        if (Array.isArray(res)) {
          const all = res as {
            id?: number;
            first_name: string;
            middle_name?: string;
            last_name: string;
            suffix?: string;
          }[];
          const mapped = all.map((r) => ({
            label: `${r.last_name}, ${r.first_name}${r.middle_name ? " " + r.middle_name : ""}${r.suffix ? " " + r.suffix : ""}`,
            value: `${r.last_name}, ${r.first_name}${r.middle_name ? " " + r.middle_name : ""}${r.suffix ? " " + r.suffix : ""}`,
          }));
          setAllResidents(mapped);
        }
      })
      .catch(() => setAllResidents([]));
  }, []);

  // Search logic for residentOptions (Add Members input)
  useEffect(() => {
    if (!residentSearch) {
      setResidentOptions([]);
      return;
    }
    const matches = allResidents
      .filter((r) =>
        r.label.toLowerCase().includes(residentSearch.toLowerCase())
      )
      .map((r) => r.label);
    setResidentOptions(matches);
  }, [residentSearch, allResidents]);

  // Filtered residents for head dropdown
  const filteredResidents = useMemo(() => {
    if (!headSearch) return allResidents;
    return allResidents.filter((r) =>
      r.label.toLowerCase().includes(headSearch.toLowerCase())
    );
  }, [allResidents, headSearch]);

  async function onSubmit(values: z.infer<typeof householdSchema>) {
    toast.success("Household added sucessfully", {
      description: `${values.household_number} was added`
    });
    setOpenModal(false);
    await invoke("insert_household_command", {
      household: {
        household_number: values.household_number,
        type_: values.type_,
        members: values.members,
        head: values.head,
        zone: values.zone,
        date: values.date.toISOString().split("T")[0],
        status: values.status,
        selected_residents: selectedResidents,
      },
    });
    onSave();
    form.reset();
    setSelectedResidents([]);
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
            Add Household
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-black">Create Household</DialogTitle>
                <DialogDescription className="text-sm">
                  All the fields are required unless it is mentioned otherwise
                </DialogDescription>
                <p className="text-md font-bold text-black">Basic Household Information</p>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div>
                  <FormField
                    control={form.control}
                    name="household_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="text-black font-bold text-xs">Household Number</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            type="number"
                            placeholder="Enter Household name"
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
                    name="type_"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel htmlFor="type" className="text-black font-bold text-xs">Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder={"Please select the household type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectOption.map((option, i) => (
                              <SelectItem value={option} key={i} className="text-black">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="head"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-bold text-xs">Head of Household</FormLabel>
                        <Popover open={headOpen} onOpenChange={setHeadOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={headOpen}
                              className="w-full justify-between text-black"
                            >
                              {field.value
                                ? allResidents.find((res) => res.value === field.value)?.label
                                : "Select Head of Household"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Head of Household..."
                                className="h-9"
                                value={headSearch}
                                onValueChange={setHeadSearch}
                              />
                              <CommandEmpty>No Residents Found</CommandEmpty>
                              <div className="h-60 overflow-hidden">
                                <Virtuoso
                                  style={{ height: "100%" }}
                                  totalCount={filteredResidents.length}
                                  itemContent={(index) => {
                                    const res = filteredResidents[index];
                                    return (
                                      <CommandItem
                                        key={res.value}
                                        value={res.value}
                                        className="text-black"
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue);
                                          setHeadOpen(false);
                                        }}
                                      >
                                        {res.label}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === res.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    );
                                  }}
                                />
                              </div>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <div>
                  <FormField
                    control={form.control}
                    name="members"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="members" className="text-black font-bold text-xs">Family Members</FormLabel>
                        <FormControl>
                          <Input
                            id="members"
                            type="number"
                            placeholder="How many family members"
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
                <FormLabel className="text-black font-bold text-xs">Add Members</FormLabel>
                <Input
                  type="text"
                  placeholder={
                    selectedResidents.length > 0
                      ? selectedResidents.join(", ")
                      : "Search resident name"
                  }
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="text-black"
                />
                {residentOptions.length > 0 && (
                  <ul className="bg-white border rounded shadow mt-1 max-h-32 overflow-y-auto">
                    {residentOptions.map((name, i) => (
                      <li
                        key={i}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-black"
                        onClick={() => {
                          if (!selectedResidents.includes(name)) {
                            setSelectedResidents([...selectedResidents, name]);
                          }
                          setResidentSearch("");
                          setResidentOptions([]);
                        }}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
                <div>
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel htmlFor="type" className="text-black font-bold text-xs">Zone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder={"Please select the household type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {zone.map((option, i) => (
                              <SelectItem value={option} key={i} className="text-black">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FormLabel htmlFor="date" className="text-black font-bold text-xs">Date of Residency</FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <FormControl>
                            <PopoverTrigger asChild className="w-full text-black hover:bg-primary hover:text-white">
                              <Button
                                variant="outline"
                                className="text-black"
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
                <div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel htmlFor="type" className="text-black font-bold text-xs">Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full text-black border-black/15">
                              <SelectValue placeholder={"Please select the household type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {status.map((option, i) => (
                              <SelectItem value={option} key={i} className="text-black">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button>Save Household</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog >
    </>
  )
}
