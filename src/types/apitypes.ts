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

