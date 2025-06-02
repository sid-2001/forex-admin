interface Address {
  line1: string
  city: string
  state: string
  zip: string
  country: string
  _id: string
}

interface SenderStudent {
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
  otp: string
  enrolledCourses: string[]
  completedCourses: string[]
  enrolledBatches: string[]
  enrolledBranches: string
  assignmentSubmitted: string[]
  studentId: string
  siblings: string[]
  enrollmentDate: string
  createdAt: string
  updatedAt: string
  __v: number
  role: string
}

interface SenderAdmin {
  adminBranch: string
  _id: string
  adminName: string
  adminEmail: string
  adminPassword: string
  adminRole: string
  adminPhone: string
  adminAddress: string
  adminId: string
  createdAt: string
  updatedAt: string
  __v: number
  adminOtp: string
}

interface Message {
  senderType: 'student' | 'admin'
  sender: SenderStudent | SenderAdmin
  message: string
  _id: string
  sentOn: string
}

//@ts-ignore
interface Messages {
  messages: Message[]
}

export interface Query {
  _id: string
  title: string
  category: string
  status: string
  isAnswered: boolean
  askedBy: {
    _id: string
    firstName: string
    lastName: string
    enrolledBranches: string
  }
  // message: Array<Message>
  messages: Message[]
  askedOn: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface QueryResponse {
  success: boolean
  queries: Query[]
}

export interface SingleQueryResponse {
  success: boolean
  query: Query
}

// Example usage:
