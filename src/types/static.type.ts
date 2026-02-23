interface CountryData {
  "countryCode": String,
  "countryName": String,
  "status": String,
  "countryFlag": String
  "active":Boolean
}
 interface PaymentGateway {
  id: string;
  countryCode: string;
  company: string;
  gatewayLink: string;
  costFee: number;
  currencyMode: string;
  paymentGateway: string;
  imageUrl: string;
  activeStatus: boolean;
}

export type { CountryData,PaymentGateway}