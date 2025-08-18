export type User = {
  Username: string
  Role: string
  ID: number
}

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

export type Resident = {
  Firstname: string
  Middlename: string
  Lastname: string
  Suffix: string
  CivilStatus: string
  Gender: "Male" | "Female" | ""
  Nationality: string
  Religion: string
  Occupation: string
  Zone: number
  Status: "Active" | "Dead" | "Missing" | "Moved Out" | ""
  Birthplace: string
  EducationalAttainment: string
  Birthday: Date
  IsVoter: boolean
  Image: File | null
  AvgIncome: number
  MobileNumber: string
  ID: number
}

