import { ResProps } from "@/service/api/household/getHousehold";

// export type Event = {
//   id: number;
//   name: string,
//   type_: string,
//   status: "Upcoming" | "Finished" | "Ongoing" | "Cancelled",
//   date: Date,
//   venue: string,
//   attendee: string,
//   notes: string
// }

export type Resident = {
  id: number;
  is_registered_voter: boolean;
  is_pwd: boolean;
  is_senior: boolean;
  prefix: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  full_name?: string;
  civil_status: string;
  gender: "Male" | "Female";
  nationality: string;
  mobile_number: string;
  date_of_birth: Date;
  town_of_birth: string;
  province_of_birth: string;
  zone: string;
  barangay: string;
  town: string;
  province: string;
  father_prefix: string;
  father_first_name: string;
  father_middle_name: string;
  father_last_name: string;
  father_suffix: string;
  mother_prefix: string;
  mother_first_name: string;
  mother_middle_name: string;
  mother_last_name: string;
  status: "Moved Out" | "Active" | "Dead" | "Missing";
  photo?: any;
};

// export type Household = {
//   id?: number;
//   household_number: string;
//   type_: string;
//   members: ResProps[];
//   head: string;
//   zone: string;
//   date: Date;
//   status: "Moved Out" | "Active" | string;
//   selectedResidents?: string[]; // optional list of selected members
// };

// export type Income = {
//   [x: string]: any;
//   id?: number;
//   category: string,
//   type_: string,
//   amount: number,
//   or_number: number,
//   received_from: string,
//   received_by: string,
//   date: Date,
// }

// export type Expense = {
//   [x: string]: any;
//   id?: number;
//   type_: string;
//   category: string;
//   amount: number;
//   or_number: number;
//   paid_to: string;
//   paid_by: string;
//   date: Date;
// };

// export type Certificate = {
//   id?: number;
//   name: string;
//   type_: string;
//   age?: number;
//   civil_status?: string;
//   ownership_text?: string;
//   amount?: string;
//   issued_date?: string;
// };

// export type Blotter = {
//   id?: number;
//   type_: string;
//   reported_by: string;
//   involved: string;
//   incident_date: Date; 
//   location: string;
//   zone: string;
//   status: string;
//   narrative: string;
//   action: string;
//   witnesses: string;
//   evidence: string;
//   resolution: string;
//   hearing_date: Date; 
// };

// export type Settings = {
//   id?: number;
//   barangay: string;
//   municipality: string;
//   province: string;
//   phone_number: string;
//   email: string;
//   logo?: string;
//   logo_municipality?: string;
// };


// export type Official = {
//   id: number;
//   name: string;
//   role: string;
//   image: string;
//   section: string;
//   age: number;
//   contact: string;
//   term_start: string;
//   term_end: string;
//   zone: string;
// };

export type User = {
  id?: number;
  username: string;
  password: string;
};

export type Logbook = {
  id: number;
  official_name: string;
  date: Date;
  time_in_am?: string;
  time_out_am?: string;
  time_in_pm?: string;
  time_out_pm?: string;
  remarks?: string;
  status?: string;
  total_hours?: number;
};
