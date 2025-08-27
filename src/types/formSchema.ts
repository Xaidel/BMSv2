import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(2, {
    message: "Username is too short"
  }).max(50, {
    message: "Username is too long"
  }),
  password: z.string().min(2, {
    message: "Password is too short"
  }).max(50, {
    message: "Password is too long"
  })
})

const statusOption = ["Upcoming", "Ongoing", "Finished", "Cancelled"] as const;

export const eventSchema = z.object({
  Name: z.string().min(2, {
    message: "Event name is too short"
  }).max(50, {
    message: "Event name is too long, put other details on the 'details' form"
  }),
  Type: z.string().min(2, {
    message: "Event type is too short"
  }).max(50, {
    message: "Event type is too long."
  }),
  Date: z.date({
    required_error: "Please specify the event date"
  }),
  Venue: z.string().min(2, {
    message: "Event venue is too short"
  }).max(50, {
    message: "Event venue is too long"
  }),
  Audience: z.string().min(2, {
    message: "Attendee too long"
  }).max(50, {
    message: "Event venue is too long"
  }),
  Notes: z.string().max(1000, {
    message: "Important notes is too long"
  }),
  Status: z.enum(statusOption)
})

export const residentSchema = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().min(1),
  suffix: z.string().nullable().optional(),
  civil_status: z.string().min(1),
  gender: z.union([
    z.enum(["Male", "Female"]),
    z.literal("")
  ]),
  nationality: z.string().min(1),
  occupation: z.string().min(1),
  mobile_number: z.string().regex(/^09\d{9}$/, "Invalid mobile number").optional(),
  date_of_birth: z.coerce.date({ required_error: "Birthday required" }),
  town_of_birth: z.string().min(1),
  zone: z.string().min(1),
  educAttainment: z.string().min(1),
  religion: z.string().min(1),
  barangay: z.string().min(1),
  town: z.string().min(1),
  province: z.string().min(1),
  status: z.union([
    z.enum(["Active", "Dead", "Missing", "Moved Out"]),
    z.literal("")
  ]),
  photo: z.instanceof(File).optional().nullable(),
  is_registered_voter: z.boolean().default(false),
  is_pwd: z.boolean().default(false),
  is_senior: z.boolean().default(false),
  income: z.coerce.number()
});

export const householdSchema = z.object({
  household_number: z.number().min(1),
  type_: z.string().min(2, {
    message: "Household type is too short"
  }).max(50, {
    message: "Household type is too long."
  }),
  members: z.number().min(1),
  head: z.string().min(2, {
    message: "Household head name is too short"
  }).max(50, {
    message: "Household head name is too long"
  }),
  zone: z.string().min(2, {
    message: "Zone is too short"
  }).max(50, {
    message: "Zone is too long"
  }),
  date: z.date({
    required_error: "Please specify the registration date"
  }),
  status: z.string().max(1000, {
    message: "Status is too long"
  }),
  selectedResidents: z.array(z.string()).optional()
})

export const incomeSchema = z.object({
  Type: z
    .string()
    .min(2, { message: "Type is too short" })
    .max(50, { message: "Type is too long. Add extra details in the remarks." }),

  Category: z
    .string()
    .min(1, { message: "Category is required" }),

  Amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0.01, { message: "Amount must be greater than zero" })
    .max(1_000_000, { message: "Amount exceeds maximum allowed value" }),

  OR: z
    .string()
    .min(1, { message: "OR# is required" }),

  ReceivedFrom: z
    .string()
    .min(2, { message: "Received From name is too short" })
    .max(50, { message: "Received From name is too long" }),

  ReceivedBy: z
    .string()
    .min(2, { message: "Received By name is too short" })
    .max(50, { message: "Received By name is too long" }),
  DateReceived: z.date({
    required_error: "Please specify the event date"
  }),
});

export const expenseSchema = z.object({
  type_: z.string().min(2, {
    message: "Type name is too short",
  }).max(50, {
    message: "Type name is too long, put other details on the 'details' form",
  }),

  category: z.string().min(1, {
    message: "Category is required",
  }),

  amount: z.number({
    invalid_type_error: "Amount must be a number",
  }).min(0.01, {
    message: "Amount must be greater than zero",
  }).max(1_000_000, {
    message: "Amount exceeds maximum allowed value",
  }),

  or_number: z.number({
    invalid_type_error: "OR# must be a number",
  }).min(1, {
    message: "OR# is required",
  }),

  paid_to: z.string().min(2, {
    message: "Paid From name is too short",
  }).max(50, {
    message: "Paid From name is too long",
  }),

  paid_by: z.string().min(2, {
    message: "Paid By name is too short",
  }).max(50, {
    message: "Paid By name is too long",
  }),

  date: z.date({
    required_error: "Please specify the issued date",
    invalid_type_error: "Invalid date format",
  }),
});

export const blotterSchema = z.object({
  ID: z.number().optional(), // Make optional if used for new entries
  Type: z.string().min(1, "Type is required"),
  ReportedBy: z.string().min(1, "Reporter is required"),
  Involved: z.string().min(1, "Involved parties are required"),
  IncidentDate: z.date(),
  Location: z.string().min(1, "Location is required"),
  Zone: z.string().min(1, "Zone is required"),
  Status: z.string().min(1, "Status is required"),
  Narrative: z.string().min(1, "Narrative is required"),
  Action: z.string().min(1, "Action is required"),
  Witnesses: z.string().min(1, "Witnesses are required"),
  Evidence: z.string().min(1, "Evidence is required"),
  Resolution: z.string().min(1, "Resolution is required"),
  HearingDate: z.date(),
});

export const settingsSchema = z.object({
  ID: z.number().optional(),
  Barangay: z.string().min(1),
  Municipality: z.string().min(1),
  Province: z.string().min(1),
  PhoneNumber: z.string().min(1),
  Email: z.string().email(),
  Logo: z.string(),
  LogoMunicipality: z.string(),
});


export const officialSchema = z.object({
  ID: z.number().optional(),
  Name: z.string().min(2, { message: "Name is too short" }).max(100, { message: "Name is too long" }),
  Role: z.string().min(2, { message: "Role is too short" }).max(100, { message: "Role is too long" }),
  Age: z.number().min(18, { message: "Age must be at least 18" }),
  Contact: z.string().min(1, { message: "Contact is too short" }).max(20, { message: "Contact is too long" }),
  TermStart: z.date({ required_error: "Start of term is required" }),
  TermEnd: z.date({ required_error: "End of term is required" }),
  Zone: z.string().min(1, { message: "Zone is required" }),
  Image: z.string().optional(),
  Section: z.string().min(1, { message: "Section is required" }),
});

export const logbookSchema = z.object({
  id: z.number().optional(),
  official_name: z.string().min(1, "Please select an official"),
  date: z.date({ required_error: "Please specify the log date" }),
  time_in_am: z.string().optional(),
  time_out_am: z.string().optional(),
  time_in_pm: z.string().optional(),
  time_out_pm: z.string().optional(),
  remarks: z.string().optional(),
  status: z.string().optional(),
  total_hours: z.number().optional(),
});