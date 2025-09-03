export interface Address {
  country: string
  zipCode: string
  state: string
  city: string
}

export interface KYCDetails {
  idType: string
  verificationType: string
  documentStatus: 'uploaded' | 'NotUploaded'
  documentLink: string
  verificationStatus: string
  documnentNumber: string
  expiryDate: string
  nameAsPerDocument: string
  issuingAuthoriy: string
  additionalComment: string
  failureCause?: string // Optional as it only appears in incomeProof
}

export interface KYC {
  idProof: KYCDetails
  addressProof: KYCDetails
  incomeProof: KYCDetails
}

export interface Customer {
  id: number
  kycId: string
  customerName: string
  nationality: string
  residentCountry: string
  idProof: string
  addressProof: string
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' // Add more statuses as needed
  pemanentAddress: Address
  currentAddress: Address
  kyc: KYC
  dob: string // Date in YYYY-MM-DD format
  phone: string
  email: string
  kycSubmittedOn: string // Date in YYYY-MM-DD format
  verifiedOn: string // Date or "N/A"

   applicantName:string,
  
     kycCountry:string,
     applicantId:string,
     kycStatus:string
}
