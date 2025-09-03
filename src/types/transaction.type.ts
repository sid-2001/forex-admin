export interface TransactionDetailsResponse {
  message: string
  status: boolean
  transactionDetailsList: TransactionDetail[]
}
export interface TransactionDetail {
  transactionOutward: TransactionOutward
  transactionInward: TransactionInward
  beneficiary: Beneficiary
  applicant: Applicant
}

export interface Applicant {
  applicantId: string
  firstName: string
  middleName: string
  lastName: string
  residenceCountry: string
  nationality: string
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
  applicantState: string
  residenceState: string
  applicantCreatedDate: string // ISO date string
  applicantModifiedDate: string // ISO date string
}

export interface TransactionOutward {
  transactionNumber: string
  sendCountry: string
  receiveCountry: string
  applicantId: string
  receiverId: string
  dealCoverNumber: string
  exchangeRates: number
  principalCurrency: string
  principalAmount: number
  settlementCurrency: string
  settlementAmount: number
  charges: number
  lcharges2: number
  destinationBankBicCode: string
  transactionStatus: string
  reportingStatus: string
  owCreatedDate: string
  owModifiedDate: String
  reconId: string
}

export interface TransactionInward {
  transactionNumberIw: string
  owTransactionNumber: string
  sendingCountry: string
  receivingCountry: string
  settlementCurrency: string
  settlementAmount: number
  reportingStatus: string
  destinationBankCode: string
}

export interface TransactionInwardCalclulated {
  transactionNumberIw: string
  owTransactionNumber: string
  sendingCountry: string
  receivingCountry: string
  settlementCurrency: string
  settlementAmount: number
  reportingStatus: string
  destinationBankCode: string
  beneficiaryId: string
  residenceCountry: string
  nationality: string
  beneficiaryName: string
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
export interface TansactionOutwardCalculated {
  transactionNumber: string
  sendCountry: string
  receiveCountry: string
  applicantId: string
  receiverId: string
  dealCoverNumber: string
  exchangeRates: number
  principalCurrency: string
  principalAmount: number
  settlementCurrency: string
  settlementAmount: number
  charges: number
  lcharges2: number
  destinationBankBicCode: string
  transactionStatus: string
  reportingStatus: string
  beneficiaryId: string
  residenceCountry: string
  nationality: string
  beneficiaryName: string
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

export interface TransactionInward {
  transactionNumberIw: string
  owTransactionNumber: string
  sendingCountry: string
  receivingCountry: string
  settlementCurrency: string
  settlementAmount: number
  reportingStatus: string
  destinationBankCode: string
  inCreatedDate: string // ISO date string
  inModifiedDate: string // ISO date string
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
