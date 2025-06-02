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
  trainers: any[]
  students: any[]
  firstLogin: boolean
  role: string
  admin: string
  ownerId: string
  branchId: string
  createdAt: string
  updatedAt: string
  __v: number
  otp: string | null
}
