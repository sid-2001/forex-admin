import axios from "axios";

import { BaseService } from "./base.service";
import api1 from './apis/api1'
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_KYC,VITE_APP_STATIC } = import.meta.env

export class KycService extends BaseService{

async verifyDocument(doccode:string,kycid:string){

let url=`${VITE_APP_KYC}/api/kyc/documents/${kycid}/${doccode}/verify`
    try{
        let payload= {
            "kycId": kycid,               // KYC ID for this document
            "documentCode": doccode  // Document Code
              }
// let {data}=await axios.post(url,payload)

const { data } = await axios.post(url, payload);

return data
    }
    catch(err){
console.log(err)

    }
}

async unverifyDocument(doccode:string,kycid:string){

    let url=`${VITE_APP_KYC}/api/kyc/documents/${kycid}/${doccode}/unVerify`
        try{
            let payload= {
                "kycId": kycid,               // KYC ID for this document
                "documentCode": doccode  // Document Code
                  }
    // let {data}=await axios.post(url,payload)
    
    const { data } = await axios.post(url, payload);
    
    return data
        }
        catch(err){
    console.log(err)
    
        }
    }


async changeKycStatus(status:string,kycid:string){


   

        let url=`/api/kyc/kyc/kycId/${kycid}/kycStatus/${status}`
            try{
              
        // let {data}=await axios.post(url,payload)
        
        const { data } = await api1.post(url, {});
        
        return data
            }
            catch(err){
        console.log(err)
        
            }
        }

async createComment(payload:any){

let url=`${VITE_APP_KYC}/api/comments`

    try{

    
     let data= axios.post(url,payload)
     return data
    }
    catch(err){

        console.log(err)
    }
}

  //@ts-ignore

async getComment(kyc_id:any):Promise<Array<{
    commentId: string;
    commentText: string;
    commentDate: string; // ISO format
    user: string;
    kycId: string;
  }>>{

    let url=`/api/kyc/comments`
    
        try{
         let data= api1.get(url)
         
         return data
        }
        catch(err){
    
            console.log(err)
            return null as any
        }
    }
    

//@ts-ignore
async getCharges(souceCountry,destinationCountry,amount,segment){

  let url=`/api/charges/service/filter?sendingCountry=SA&receivingCountry=${destinationCountry}&amount=${amount}&marketSegment=${segment}`
    try{

        
let data=await api1.get(url)
return (data) as any

    }
    catch(err){



    }
}


}