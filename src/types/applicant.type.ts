interface ApplicantFormData {
  applicant: any
  applicantName: string
  city: string
  country: string
  email: string
  nationality: string
  phone: string
  physicalAddressLine1: string
  physicalAddressLine2: string
  physicalAddressLine3: string
  postalAddressLine1: string
  postalAddressLine2: string
  postalAddressLine3: string
  postalCode: string
  residenceCity: string
  residenceCountry: string
  residencePostalCode: string
  residenceState: string
  state: string
}

export interface ApplicantResponse {
  success: boolean
  message: string
  data: ApplicantFormData
}

export interface Applicant {
  applicantId: string
  residenceCountry: string
  nationality: string
  applicantName: string
  physicalAddressLine1: string
  physicalAddressLine2: string
  physicalAddressLine3: string
  residenceSuburb: string
  residenceCity: string
  residencePostalCode: string
  postalAddressLine1: string
  postalAddressLine2: string
  postalAddressLine3: string
  suburb: string
  postalCode: string
  city: string
  country: string
  reference: boolean
  marketSegment: string
  activeStatus: boolean
  stopDebit: boolean
  stopCredit: boolean
  reportFraud: boolean
  disabledStatus: boolean
}

export interface ApplicantContactDetail {
  applicantContactDetailsId: string
  contactType: string
  contactDetails: string
  contactCountry: string
  applicant: string
  activeStatus: boolean
}

export interface ApplicantDigitalId {
  applicantDigitalId: string
  digitalIdType: string
  databaseLink: string
  status: string
  applicant: string
  activeStatus: boolean
}

export interface ApplicantIdDetail {
  applicantDetailsId: string
  idCountry: string
  idType: string
  idDetails: string
  idVerifiedCompliantFlag: boolean
  applicantId: string
  activeStatus: boolean
}

export interface ApplicantKYCStatus {
  applicantKycStatusId: string
  complianceType: string
  documentsNeeded: string
  status: string
  applicant: string
  activeStatus: boolean
}

export interface Beneficiary {
  beneficiaryId: string
  residenceCountry: string
  nationality: string
  beneficiaryFirstName: string
  beneficiaryMiddleName: string
  beneficiaryLastName: string
  accountNumber: string
  idType: string
  idNumber: string
  physicalAddressLine1: string
  physicalAddressLine2: string
  physicalAddressLine3: string
  suburb: string
  city: string
  postCode: string
  country: string
  bankName: string
  bankBicCode: string
  sortCode: string
  iban: string
  profileStatus: boolean
  sanctionStatus: boolean
  fraudStatus: boolean
  applicant: string
  activeStatus: boolean
}

export interface ApplicantData {
  applicant: Applicant
  applicantContactDetails: ApplicantContactDetail[]
  applicantDigitalId: ApplicantDigitalId[]
  applicantIdDetails: ApplicantIdDetail[]
  applicantKYCStatus: ApplicantKYCStatus[]
  beneficiaryList: Beneficiary[]
}

export interface KYCData {
  kycId: string
  kycStatus: string
  kycStartDate: string | null
  kycApprovalDate: string | null
  kycExpiryDate: string
  kycCountry: string
  dob: string
  email: string
  preferredContactMethod: string
  contactNumber: string
  applicantName: string
  nationality: string
  permanentAddressLine1: string
  permanentAddressLine2: string
  permanentAddressSuburb: string
  permanentAddressCity: string
  permanentAddressState: string
  permanentAddressZip: string
  permanentAddressCountry: string
  currentAddressLine1: string
  currentAddressLine2: string
  currentAddressSuburb: string
  currentAddressCity: string
  currentAddressState: string
  currentAddressZip: string
  currentAddressCountry: string
  kycCustomerImage: string
  applicantId: string
  sanctionPartnerId: string
  documents: Document[]
  comments: Comment[]
}

export interface Document {
  kycId: string
  documentCode: string
  uploadDate: string
  verificationStatus: string
  documentUrl: string
  verificationStatusComments: string
}

export interface Comment {
  commentId: string
  commentText: string
  commentDate: string
  user: string
}
