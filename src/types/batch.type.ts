interface Course {
  _id: string
  name: string
}

interface Tutor {
  _id: string
  firstName: string
  lastName: string
}

export interface Batch {
  _id: string
  name: string
  standard: string
  course: Course
  startDate: string // ISO 8601 format string
  endDate: string // ISO 8601 format string
  startTime: string // format 'hh:mm AM/PM'
  endTime: string // format 'hh:mm AM/PM'
  tutor: Tutor
  maxSeats: number
  branch: {
    _id: string
    name: string
  }
  students: Array<string> // assuming student IDs are strings
  isActive: boolean
  joiningLink?: string
  createdAt: string // ISO 8601 format string
  updatedAt: string // ISO 8601 format string
  __v: number
}
