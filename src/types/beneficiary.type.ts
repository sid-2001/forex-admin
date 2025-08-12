export interface BeneficiaryFormData {
  applicant: string
  // beneficiaryId: string;
  beneficiaryName: string
  nationality: string
  residentCountry: string
  physicalAddressLine1: string
  physicalAddressLine2: string
  physicalAddressLine3: string
  suburb: string
  city: string
  state: string
  zipCode: string
  country: string
  accountHolderName: string
  accountNumber: string
  bankName: string
  bankBicCode: string
  bankLocation: string
  ifscCode: string
}

export interface BeneficiaryFormErrors {
  applicant?: string
  beneficiaryName?: string
  nationality?: string
  residentCountry?: string
  phone?: string
  email?: string
  idType?: string
  physicalAddressLine1?: string
  physicalAddressLine2?: string
  physicalAddressLine3?: string
  suburb: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  accountHolderName?: string
  accountNumber?: string
  bankName?: string
  bankBicCode?: string
  bankLocation?: string
  ifscCode?: string
}

export interface AddBeneficiaryProps {
  // You can pass additional props here if needed
}

export interface BeneficiaryResponse {
  success: boolean
  formData: BeneficiaryFormData
  formErrors: BeneficiaryFormErrors
  isSubmitting: boolean
}
