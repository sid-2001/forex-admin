// Root API response
export interface CountryLabelApiResponse {
  status: boolean;
  message: string;
  data: CountryLabelData;
}

// Data wrapper
export interface CountryLabelData {
  countryLabelCode: CountryLabelCode;
  countryReportingLabelDTO: CountryReportingLabelDTO[];
}

// Country label code object
export interface CountryLabelCode {
  countryLabelCode: string;
  countryCode: string;
  railPayoutMappingCode: string;
  countryReportingCode: string;
  channel: string;
  active: boolean;
  createdBy: string;
  modifiedBy: string;
  effectiveFromDate: string; // ISO datetime
  effectiveToDate: string;   // ISO datetime
  createdLocalDateTime: string;
  createdTimeZone: string;
  createdOffset: string;
  modifiedLocalDateTime: string;
  modifiedTimeZone: string;
  modifiedOffset: string;
  createdUtcDatetime: string | null;
  modifiedUtcDatetime: string | null;
}

// Country reporting label mapping
export interface CountryReportingLabelDTO {
  id: string;
  countryLabelCode: string;
  countryLabelFieldNameAndValidation: CountryLabelFieldNameAndValidation;
  requirementLevels: string; // e.g. "M"
  visibility: string;        // "Y" | "N"
  active: boolean;
  createdBy: string;
  modifiedBy: string | null;
  effectiveFromDate: string;
  effectiveToDate: string;
  createdLocalDateTime: string;
  createdTimezone: string | null;
  createdOffset: string | null;
  modifiedLocalDateTime: string;
  modifiedTimezone: string;
  modifiedOffset: string;
  createdUtcDatetime: string | null;
  modifiedUtcDatetime: string | null;
}

// Field name + validation metadata
export interface CountryLabelFieldNameAndValidation {
  fieldLabelCode: string;
  fieldName: string;
  channelCode: string;
  screen: string;
  label: string;
  description: string;
  minLength: number;
  maxLength: number;
  dataType: string; // could be union: "STRING" | "NUMBER" etc.
  validationRequired: string; // "Y" | "N"
  validationMessageMandatory: string;
  validationMessageOptional: string;
  validationRegex: string;
  validationMessageError: string;
  createdBy: string;
  modifiedBy: string | null;
}

  export interface LoginPageLabel{
  "usename":String,
  "password":String
  "username_validataion_msg":String,
  "username_minimum_legth":Number,
  "username_max_length":Number,
  "username_regx":String,
  "Password_validataion_msg":String
  "Password_minimum_legth":Number,
  "Password_max_length":Number,
  "Password_regx":String,
}