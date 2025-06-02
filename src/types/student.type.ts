interface Address {
  line1: string
  city: string
  state: string
  zip: string
  country: string
  _id: string
}

interface EnrolledBranch {
  _id: string
  name: string
  email: string
  ownerEmail: string
  ownerName: string
  ownerPassword: string
  ownerPhone: string
  description: string
  address: Address
  phone: string
  batches: string[]
  trainers: string[]
  students: string[]
  firstLogin: boolean
  role: string
  admin: string
  otp: string | null
  ownerId: string
  branchId: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Student {
  role: string
  _id: string
  firstName: string
  lastName: string
  parentEmail: string
  parentPhone: string
  studentEmail: string
  password: string
  age: number
  gender: string
  standard: string
  status: string
  address: Address
  firstLogin: boolean
  otp: string | null
  enrolledCourses: string[]
  completedCourses: string[]
  enrolledBatches: string[]
  assignmentSubmitted: string[]
  studentId: string
  siblings: string[]
  enrollmentDate: string
  createdAt: string
  updatedAt: string
  __v: number
  enrolledBranches: EnrolledBranch
}
interface Address {
  line1: string
  city: string
  state: string
  zip: string
  country: string
}

export interface AddStudent {
  firstName: string
  lastName: string
  age: string
  standard: string
  branch: string
  parentEmail: string
  parentPhone: string
  studentEmail: string
  gender: string
  address: Address
  password: string
}

export interface Courses {
  _id: string
  name: string
  description: string
  durationWeeks: number
  price: number
  category: string
  standard: string
  isActive: true
  subject: string
  curriculam: [
    {
      weekNumber: 1
      days: [
        {
          day: string
          topic: string
          _id: string
        },
      ]
    },
  ]
}

interface User {
  _id: string
  firstName: string
  lastName: string
  enrolledBranches: string
}

interface Course {
  _id: string
  name: string
  standard: string
  subject: string
}

export interface NewEnrollment {
  _id: string
  user: User
  course: Course
  startDate: string
  endDate: string
  isAllocated: boolean
  isActive: boolean
  transaction: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface StudentLiveCourses {
  success: boolean
  courses: Array<Courses>
}
