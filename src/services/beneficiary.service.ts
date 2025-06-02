import { BeneficiaryFormData, BeneficiaryResponse } from "@/types/beneficiary.type";
import api1 from "./apis/api1";
import { BaseService } from "./base.service";
import axios from "axios";

const { VITE_APP_BENIFICIARY,VITE_APP_TRANSACTION } = import.meta.env

class BeneficiaryService extends BaseService {
        async submitBeneficiaryForm(payload: BeneficiaryFormData): Promise<BeneficiaryResponse> {
            let url = '/api/applicant/beneficiary/create'; 
            try {

              
            let response = await api1.post(url, payload); 
            return response as any; 
            } catch (err) {
                console.log("error in service file", err)
            throw new Error("Unable to submit beneficiary form. Please try again.");
            }
        }

        async searchByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryFormData> {
            let url = `/api/applicant/beneficiary/${beneficiaryId}`;  
            try {
              const {data} = await api1.get(url); 
         
              return data;  
            } catch (err) {
              console.error('Error fetching  data:', err);
              throw new Error('Unable to fetch applicant data. Please try again.');
            }
          }

          async getTransactionsByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryFormData> {
            let url = `/api/transactions/transaction-details/beneficiary/${beneficiaryId}`;  
            try {

              const {data} = await api1.get(url); 
              console.log("responseeee", data)
              return data;  
            } catch (err) {
              console.error('Error fetching  data:', err);
              throw new Error('Unable to fetch applicant data. Please try again.');
            }
          }

          async searchByApplicantId(applicantId: string): Promise<BeneficiaryResponse> {
            let url = `/api/applicant/beneficiary/applicant/${applicantId}`;  
            try {
              const { data } = await api1.get(url); 
              return data;  
            } catch (err) {
              console.error('Error fetching  data:', err);
              throw new Error('Unable to fetch applicant data. Please try again.');
            }
          }

          async searchByBeneficiaryIdAndApplicantId(beneficiaryId:string, applicantId:string): Promise<BeneficiaryFormData>{
            let url = `beneficiary/${beneficiaryId}/applicant/${applicantId}`
            try{
                let response = await api1.get(url);
                return response;
            }catch(err){
                console.log(err);
                throw new Error('Unable to fetch');
            }
          }

          async updateBeneficiaryForm( payload: BeneficiaryFormData): Promise<BeneficiaryResponse> {
            let url = `/api/applicant/beneficiary/update`;  
            try {
                let response = await axios.post(url, payload);  
                return response.data;  
            } catch (err) {
                console.log("Error in service file:", err);
                throw new Error("Unable to update beneficiary form. Please try again.");
            }
        }
        
}
  export {BeneficiaryService}



 