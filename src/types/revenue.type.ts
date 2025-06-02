interface Address {
  line: string
  city: string
  state: string
  zip: string
  country: string
  _id: string
}

export interface Branch {
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
  isBranchActive: boolean
}

export interface Transaction {
  _id: string
  amount: number
  user: string
  status: string
  branch: string
  course: string
  subscriptionStatus?: boolean
  date: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface RevenueDetail {
  totalRevenue: number
  transactions: Transaction[]
  branch: Branch
}

export interface RevenueResponse {
  success: boolean
  revenueDetails: RevenueDetail[]
}
