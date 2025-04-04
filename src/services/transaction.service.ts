import { TransactionDetailsResponse, TransactionInward } from '@/types/transaction.type'
import api1 from './apis/api1'
import { BaseService } from './base.service'
import axios from 'axios'
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_TRANSACTION,VITE_FOREX_APP_CREDENTIALS } = import.meta.env





export class TransactionService extends BaseService {
  async gettransactions(): Promise<TransactionDetailsResponse> {

 
 
    
    let url = '/api/transactions/transaction-details'
    try {


      // http://64.227.139.142:9091/api/applicant/applicant-all-details
 



      let data = await api1.get(url)
      
      return data as any
    } catch (e) {
      throw new Error(e as any)
    }
  }


  async getInwardTransaction(receving_country:any): Promise<Array<TransactionInward>> {
   
    let url = `/api/transactions/transaction-inward/receivingCountry/${receving_country}`
    try {

      let data = await api1.get(url)
      console.log(data)
      
      return data?.transactionDetailList as any
    } catch (e) {
      throw new Error(e as any)
    }
  }


    
   
  async getBalanceEnquiry(): Promise<Array<TransactionInward>> {
   
    let url = `/api/transactions/transaction-details//balanceEnquiry`
    try {

      let {data} = await api1.get(url)
      console.log(data)
      
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }


  async getOutwardTransaction(): Promise<TransactionDetailsResponse> {
   
    let url = `/api/transactions/transaction-details`
    try {


      // http://64.227.139.142:9091/api/applicant/applicant-all-details
 



      let data = await api1.get(url)
      
      return data as any
    } catch (e) {
      throw new Error(e as any)
    }
  }
  async createTransaction(payload: any) {
    let url = `${VITE_APP_TRANSACTION}/api/transactions/transaction-outward/create`
    try {

      
      let { data } = await axios.post(url, payload)



      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createDealcover(payload: {
    "sourceCurrency": String,
    "destinationCurrency": String,
    "destinationCountry": String,
    "applicantId": String,
    "rate": Number
}) {
    let url = `${VITE_APP_TRANSACTION}/api/transactions/deal/bookCover`
    try {

      
      let { data } = await axios.post(url, payload)



      return data
    } catch (err) {
      console.log(err)
    }
  }


  async createZaphierTransaction(payload: {

    amount:any,
    currency:any
  }) {
    let url = `${VITE_APP_TRANSACTION}/api/zaphier/generate-uuid`
    try {
      
      let { data } = await axios.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createPayfastTransaction(transaction: any,amount:any) {
    let url = `${VITE_APP_TRANSACTION}/api/transactions/transaction-outward/ozow?amount=${amount}&transactionId=${transaction}`
    try {
      let  data  = await api1.get(url)    
      
      console.log(data)
      return data
    } catch (err) {
      console.log(err)
    }
  }

async createRecons(payload:any){
let url=`/api/transactions/recon-transactions/create`
try{
let data=await api1.post(url,payload)
return data
}
catch(err){

  console.log(err)
}

}


async getForexRate(country:any,country_state:any){


  console.log("Selected state",country_state)
  let url=`https://data.fixer.io/api/latest?access_key=${VITE_FOREX_APP_CREDENTIALS}&base=${country_state=="IN"?"INR":"ZAR"}&symbols=${country}`
  
  try{
  let {data} =await axios.get(url)

  return data.rates[country]
  }
  catch(err){
  
    console.log(err)
  }
  
  }


}
