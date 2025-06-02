import { atom } from "recoil";

const applicantFormDataState = atom({
  key: 'applicantFormDataState', 
  default: {
    applicantName: '', 
    nationality: '', 
    residenceCountry: '',
    phone: '',
    email: '',
    physicalAddressLine1: '',
    physicalAddressLine2: '',
    physicalAddressLine3: '',
    physicalCity: '',
    physicalState: '',
    physicalPostalCode: '',
    physicalCountry: '',
    postalAddressLine1: '',
    postalAddressLine2: '',
    postalAddressLine3: '',
    postalCity: '',
    postalState: '',
    postalPostalCode: '',
    postalCountry: '',
    documents: [], // Array to store document information (documentType, documentPreview)
  },
});
