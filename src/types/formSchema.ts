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

export const eventSchema = z.object({
  name: z.string().min(2, {
    message: "Event name is too short"
  }).max(50, {
    message: "Event name is too long, put other details in the notes"
  }),
  type_: z.string().min(2, {
    message: "Event type is too short"
  }).max(50, {
    message: "Event type is too long"
  }),
  status: z.enum(["Upcoming", "Finished", "Ongoing", "Cancelled"], {
    required_error: "Status is required"
  }),
  date: z.date({
    required_error: "Please specify the event date"
  }),
  venue: z.string().min(2, {
    message: "Event venue is too short"
  }).max(50, {
    message: "Event venue is too long"
  }),
  attendee: z.string().min(2, {
    message: "Attendee name is too short"
  }).max(50, {
    message: "Attendee name is too long"
  }),
  notes: z.string().max(1000, {
    message: "Notes field is too long"
  })
})

export const residentSchema = z.object({
  prefix: z.string(),
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  suffix: z.string().optional().nullable(),
  civil_status: z.string().min(1),
  gender: z.string().min(1),
  nationality: z.string().min(1),
  mobile_number: z.string().min(1),
  date_of_birth: z.date(),
  town_of_birth: z.string().min(1),
  province_of_birth: z.string().min(1),
  zone: z.string().min(1),
  barangay: z.string().min(1),
  town: z.string().min(1),
  province: z.string().min(1),
  father_prefix: z.string().min(1),
  father_first_name: z.string().min(1),
  father_middle_name: z.string().min(1),
  father_last_name: z.string().min(1),
  father_suffix: z.string().optional().nullable(),
  mother_prefix: z.string().min(1),
  mother_first_name: z.string().min(1),
  mother_middle_name: z.string().min(1),
  mother_last_name: z.string().min(1),
  status: z.string().min(1),
  photo: z.any(),
  is_registered_voter: z.boolean().default(false),
  is_pwd: z.boolean().default(false),
  is_senior: z.boolean().default(false),
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
  type_: z
    .string()
    .min(2, { message: "Type is too short" })
    .max(50, { message: "Type is too long. Add extra details in the remarks." }),

  category: z
    .string()
    .min(1, { message: "Category is required" }),

  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0.01, { message: "Amount must be greater than zero" })
    .max(1_000_000, { message: "Amount exceeds maximum allowed value" }),

  or_number: z
    .number({ invalid_type_error: "OR# must be a number" })
    .min(1, { message: "OR# is required" }),

  received_from: z
    .string()
    .min(2, { message: "Received From name is too short" })
    .max(50, { message: "Received From name is too long" }),

  received_by: z
    .string()
    .min(2, { message: "Received By name is too short" })
    .max(50, { message: "Received By name is too long" }),

  date: z.date({
    required_error: "Please specify the date received",
    invalid_type_error: "Invalid date format",
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
  id: z.number().optional(), // Make optional if used for new entries
  type_: z.string().min(1, "Type is required"),
  reported_by: z.string().min(1, "Reporter is required"),
  involved: z.string().min(1, "Involved parties are required"),
  incident_date: z.date(),
  location: z.string().min(1, "Location is required"),
  zone: z.string().min(1, "Zone is required"),
  status: z.string().min(1, "Status is required"),
  narrative: z.string().min(1, "Narrative is required"),
  action: z.string().min(1, "Action is required"),
  witnesses: z.string().min(1, "Witnesses are required"),
  evidence: z.string().min(1, "Evidence is required"),
  resolution: z.string().min(1, "Resolution is required"),
  hearing_date: z.date(),
});

export const settingsSchema = z.object({
  id: z.number().optional(),
  barangay: z.string().min(1),
  municipality: z.string().min(1),
  province: z.string().min(1),
  phone_number: z.string().min(1),
  email: z.string().email(),
  logo: z.string(),
});


export const officialSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "Name is too short" }).max(100, { message: "Name is too long" }),
  role: z.string().min(2, { message: "Role is too short" }).max(100, { message: "Role is too long" }),
  age: z.number().min(18, { message: "Age must be at least 18" }),
  contact: z.string().min(1, { message: "Contact is too short" }).max(20, { message: "Contact is too long" }),
  term_start: z.date({ required_error: "Start of term is required" }),
  term_end: z.date({ required_error: "End of term is required" }),
  zone: z.string().min(1, { message: "Zone is required" }),
  image: z.string().optional(),
  section: z.string().min(1, { message: "Section is required" }),
});