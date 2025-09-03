import { ResProps } from "@/service/api/household/getHousehold"

export type User = {
  Username: string
  Role: string
  ID: number
}

export type Resident = {
  Firstname: string
  Middlename: string
  Lastname: string
  Suffix: string
  CivilStatus: string
  Gender: "Male" | "Female" | ""
  Nationality: string
  Religion: string
  Barangay: string
  Occupation: string
  Zone: number
  Town: string,
  Province: string,
  Status: "Active" | "Dead" | "Missing" | "Moved Out" | ""
  Birthplace: string
  EducationalAttainment: string
  Birthday: Date
  IsVoter: boolean
  IsPWD: boolean
  IsSolo: boolean
  IsSenior: boolean
  Image: File | null
  AvgIncome: number
  MobileNumber: string
  ID?: number
}

export type Income = {
  ID: number
  Category: string
  Type: string
  Amount: number
  OR: string
  ReceivedFrom: string
  ReceivedBy: string
  DateReceived: Date
}

export type Expense = {
  ID: number
  Category: string
  Type: string
  Amount: number
  OR: string
  PaidTo: string
  PaidBy: string
  Date: Date
};

export type Event = {
  Name: string
  Type: string
  Venue: string
  Audience: string
  Notes: string
  Status: "Upcoming" | "Ongoing" | "Cancelled" | "Finished"
  Date: Date
  ID: number
}

export type Certificate = {
  ID?: number;
  ResidentID?: number;
  ResidentName?: string;
  Type: string;
  Amount: number;
  IssuedDate: string;
  OwnershipText?: string;
  CivilStatus?: string;
  Purpose?: string;
  Age?: number;
};

export type Blotter = {
  ID: number;
  Type: string;
  ReportedBy: string;
  Involved: string;
  IncidentDate: Date;
  Location: string;
  Zone: string;
  Status: string;
  Narrative: string;
  Action: string;
  Witnesses: string;
  Evidence: string;
  Resolution: string;
  HearingDate: Date;
};

export type Official = {
  ID: number;
  Name: string;
  Role: string;
  Image: string;
  Section: string;
  Age: number;
  Contact: string;
  TermStart: string;
  TermEnd: string;
  Zone: string;
};

export type Settings = {
  ID?: number;
  Barangay?: string;
  Municipality?: string;
  Province?: string;
  PhoneNumber?: string;
  Email?: string;
  ImageB?: string;
  ImageM?: string;
};

export type Logbook = {
  ID: number;
  Name: string;
  Date: Date;
  TimeInAm?: string;
  TimeOutAm?: string;
  TimeInPm?: string;
  TimeOutPm?: string;
  Remarks?: string;
  Status?: string;
  TotalHours?: number;
};

export type Household = {
  id?: number;
  household_number: string;
  type: string;
  member: ResProps[];
  residents?: ResProps[];
  head: string;
  zone: string;
  date: Date;
  status: "Moved Out" | "Active" | string;
  selected_resident?: string[]; // optional list of selected members
};
