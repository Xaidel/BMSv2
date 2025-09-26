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

// Program/Project status options
const programProjectStatusOption = ["Planned", "Ongoing", "Completed", "Cancelled"] as const;

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

export const programProjectSchema = z.object({
  Name: z.string().min(2, { message: "Name is too short" }).max(100, { message: "Name is too long" }),
  Type: z.enum(["Program", "Project"]),
  Description: z.string().max(1000).optional(),
  StartDate: z.date({ required_error: "Start date is required" }),
  EndDate: z.date().optional(),
  Duration: z.number().optional(),
  Location: z.string().min(2, { message: "Location is too short" }).max(100, { message: "Location is too long" }),
  Beneficiaries: z.string().max(255).optional(),
  Budget: z.number().min(0).max(1_000_000_000_000),
  SourceOfFunds: z.string().max(100).optional(),
  ProjectManager: z.string().max(100).optional(),
  Status: z.enum(programProjectStatusOption)
})

export const residentSchema = z.object({
  Firstname: z.string().min(1).optional(),
  Middlename: z.string().nullable().optional(),
  Lastname: z.string().min(1).optional(),
  Suffix: z.string().nullable().optional(),
  CivilStatus: z.string().min(1).optional(),
  Gender: z.union([z.enum(["Male", "Female"]),
        z.literal("")
  ]).optional(),
  Nationality: z.string().min(1).optional(),
  Occupation: z.string().min(1).optional(),
  MobileNumber: z.string().regex(/^09\d{9}$/, "Invalid mobile number").nullable().optional(),
  Birthday: z.coerce.date({ required_error: "Birthday required" }).optional(),
  Birthplace: z.string().nullable().optional(),
  Zone: z.coerce.number().optional(),
  EducationalAttainment: z.string().min(1).optional(),
  Religion: z.string().min(1).optional(),
  Barangay: z.string().min(1).optional(),
  Town: z.string().min(1).optional(),
  Province: z.string().min(1).optional(),
  Status: z.union([
    z.enum(["Active", "Dead", "Missing", "Moved Out"]),
    z.literal("")
  ]).optional(),
  Image: z.instanceof(File).optional().nullable(),
  IsVoter: z.coerce.boolean().default(false),
  IsPWD: z.coerce.boolean().default(false),
  IsSolo: z.coerce.boolean().default(false),
  IsSenior: z.coerce.boolean().default(false),
  AvgIncome: z.coerce.number()
}).optional();

export const householdSchema = z.object({
  HouseholdNumber: z.string().min(1, { message: "Household number is required" }),
  Type: z.string().min(2, { message: "Household type is too short" }).max(50, { message: "Household type is too long." }).optional(),
  Member: z.array(z.object({
    ID: z.number().optional(),
    Firstname: z.string(),
    Middlename: z.string().optional().nullable(),
    Lastname: z.string(),
    Suffix: z.string().optional().nullable()
  })).min(1, { message: "At least one member is required" }),
  Head: z.string().min(2, { message: "Household head name is too short" }).max(50, { message: "Household head name is too long" }).optional(),
  Zone: z.string().min(1, { message: "Zone is required" }).optional(),
  Date: z.date({ required_error: "Please specify the registration date" }).optional(),
  Status: z.enum(["Moved Out", "Active"]).optional(),
  SelectedResident: z.array(z.string()).optional()
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
    .max(1_000_000_000, { message: "Amount exceeds maximum allowed value" }),

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
  Type: z.string().min(2, {
    message: "Type name is too short",
  }).max(50, {
    message: "Type name is too long, put other details on the 'details' form",
  }),

  Category: z.string().min(1, {
    message: "Category is required",
  }),

  Amount: z.number({
    invalid_type_error: "Amount must be a number",
  }).min(0.01, {
    message: "Amount must be greater than zero",
  }).max(1_000_000_000, {
    message: "Amount exceeds maximum allowed value",
  }),

  OR: z.string()
    .min(1, { message: "OR# is required" }),

  PaidTo: z.string().min(2, {
    message: "Paid From name is too short",
  }).max(50, {
    message: "Paid From name is too long",
  }),

  PaidBy: z.string().min(2, {
    message: "Paid By name is too short",
  }).max(50, {
    message: "Paid By name is too long",
  }),
  
  Date: z.date({
    required_error: "Please specify the expense date"
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
  ImageB: z.string(),
  ImageM: z.string(),
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
  ID: z.number().optional(),
  Name: z.string().min(1, "Please select an official"),
  Date: z.date({ required_error: "Please specify the log date" }),
  TimeInAm: z.string().optional(),
  TimeOutAm: z.string().optional(),
  TimeInPm: z.string().optional(),
  TimeOutPm: z.string().optional(),
  Remarks: z.string().optional(),
  Status: z.string().optional(),
  TotalHours: z.number().optional(),
});