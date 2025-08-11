import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@/types/formSchema";
import { CalendarIcon, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Household } from "@/types/types";



const selectOption: string[] = [
  "Renter",
  "Owner",
]

const zone: string[] = [
  "Zone 1",
  "Zone 2",
  "Zone 3",
  "Zone 4",
  "Zone 5",
  "Zone 6",
]

const status: string[] = [
  "Active",
  "Moved Out"
]

export default function ViewHouseholdModal(props: Household & { onSave: () => void }) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const form = useForm<z.infer<typeof householdSchema>>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      household_number: props.household_number,
      type_: props.type_,
      head: props.head,
      members: props.members,
      zone: props.zone,
      date: props.date,
      status: props.status,
    }
  })

  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [residentSearch, setResidentSearch] = useState("");
  const [residentOptions, setResidentOptions] = useState<string[]>([]);
  const [allResidents, setAllResidents] = useState<{ label: string; value: string }[]>([]);

useEffect(() => {
  invoke("fetch_all_residents_command")
    .then((res) => {
      if (Array.isArray(res)) {
        const all = res as {
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

  // Fetch members for the current household and update selectedResidents
  if (props.id) {
    invoke("fetch_members_by_household_command", { householdId: props.id })
      .then((res) => {
        console.log("Fetched members:", res);
        if (Array.isArray(res)) {
          setSelectedResidents(res.map((r) => String(r)));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch members", err);
        setSelectedResidents([]);
      });
  }
}, [props.id]);

  useEffect(() => {
    if (!residentSearch) {
      setResidentOptions([]);
      return;
    }
    const matches = allResidents
      .filter((r) => r.label.toLowerCase().includes(residentSearch.toLowerCase()))
      .map((r) => r.label);
    setResidentOptions(matches);
  }, [residentSearch, allResidents]);

  async function onSubmit(values: z.infer<typeof householdSchema>) {
    const householdWithId = {
      ...values,
      id: props.id,
      date: values.date.toISOString(),
      selected_residents: selectedResidents,
    };
    await invoke("save_household_command", { household: householdWithId });
    toast.success("Household updated successfully", {
      description: `${values.household_number} was updated`
    });
    setOpenModal(false);
    props.onSave();
  }
  return (
    <>
      <Dialog
        open={openModal}
        onOpenChange={setOpenModal}
      >
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
                <DialogTitle className="text-black">View/Edit Household</DialogTitle>
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
                              <SelectItem value={option} key={i}>{option}</SelectItem>
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
                  <FormField
                    control={form.control}
                    name="head"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="members" className="text-black font-bold text-xs">Head of Household</FormLabel>
                        <FormControl>
                          <Input
                            id="members"
                            type="string"
                            placeholder="Enter head of household"
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
                              <SelectItem value={option} key={i}>{option}</SelectItem>
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
                              <SelectItem value={option} key={i}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormLabel className="text-black font-bold text-xs">Add Members</FormLabel>
                <div
                  className="flex flex-wrap gap-1 items-center border rounded p-2 min-h-[42px] bg-white"
                >
                  {selectedResidents.map((name, idx) => (
                    <span
                      key={idx}
                      className="relative inline-flex items-center bg-gray-200 text-black rounded-full px-3 py-1 text-xs font-medium mr-1 mb-1"
                    >
                      <span className="pr-3">{name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedResidents(prev => prev.filter((_, i) => i !== idx))}
                        aria-label={`Remove ${name}`}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-red-500 text-white hover:bg-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={selectedResidents.length === 0 ? "Search resident name" : ""}
                    value={residentSearch}
                    onChange={(e) => setResidentSearch(e.target.value)}
                    className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-black py-1"
                  />
                </div>
                {residentOptions.length > 0 && (
                  <ul className="bg-white border rounded shadow mt-1 max-h-32 overflow-y-auto z-10 relative">
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
              <div className="mt-4 flex justify-end">
                <Button type="submit">Save Household</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog >
    </>
  )
}
