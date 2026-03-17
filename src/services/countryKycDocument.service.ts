// services/countryKycDocument.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

interface CreateCountryKycDocumentPayload {
  countryCode: string
  docTypeCode: string
  docCode: string
  docDescription: string
  verificationMode: string
  verificationPartnerCode?: string
  appLimit: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

interface UpdateCountryKycDocumentPayload {
  countryCode: string
  docTypeCode: string
  docCode: string
  docDescription: string
  verificationMode: string
  verificationPartnerCode?: string
  appLimit: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
}

interface UpdateStatusPayload {
  id: string
  active: boolean
  modifiedBy: string
}

export class CountryKycDocumentService extends BaseService {
  private baseUrl = '/api/static-table/country-kyc-document-master'
  private getAllUrl = '/api/static-table/country-res-product-channel-doc-required/getAll'

  /**
   * Create a new country KYC document
   * @param payload - The document data to create
   */


    async getAllKycDocuments(): Promise<any[]> {
    try {
      const response = await api1.get(this.baseUrl+'/getAll')
    
      return response.data || []
    } catch (err) {
      console.error('Error fetching country KYC documents:', err)
      throw new Error('Unable to fetch country KYC documents. Please try again.')
    }
  }




  async createCountryKycDocument(payload: CreateCountryKycDocumentPayload): Promise<any> {
    try {
      const response = await api1.post(this.baseUrl, payload)
      return response.data
    } catch (err) {
      console.error('Error creating country KYC document:', err)
      throw new Error('Unable to create country KYC document. Please try again.')
    }
  }

  /**
   * Get all country KYC documents
   */
  async getAllCountryKycDocuments(): Promise<any[]> {
    try {
      const response = await api1.get(this.getAllUrl)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching country KYC documents:', err)
      throw new Error('Unable to fetch country KYC documents. Please try again.')
    }
  }

  /**
   * Get country KYC document by code
   * @param code - The document code
   */
  async getCountryKycDocumentByCode(code: string): Promise<any> {
    try {
      const response = await api1.get(`${this.baseUrl}/${code}`)
      return response.data
    } catch (err) {
      console.error('Error fetching country KYC document:', err)
      throw new Error('Unable to fetch country KYC document. Please try again.')
    }
  }

  /**
   * Update country KYC document
   * @param code - The document code to update
   * @param payload - The updated document data
   */
  async updateCountryKycDocument(code: string, payload: UpdateCountryKycDocumentPayload): Promise<any> {
    try {
      const response = await api1.put(`${this.baseUrl}/${code}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating country KYC document:', err)
      throw new Error('Unable to update country KYC document. Please try again.')
    }
  }

  /**
   * Update document status (activate/deactivate)
   * @param id - The document ID
   * @param active - New active status
   * @param modifiedBy - User performing the action
   */
  async updateStatus(id: string, active: boolean, modifiedBy: string): Promise<any> {
    try {
      const payload: UpdateStatusPayload = {
        id: id,
        active: active,
        modifiedBy: modifiedBy
      }
      const response = await api1.put(`${this.baseUrl}/updateStatus`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating status:', err)
      throw new Error('Unable to update status. Please try again.')
    }
  }

  /**
   * Get documents by country
   * @param countryCode - The country code
   */
  async getDocumentsByCountry(countryCode: string): Promise<any[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/country/${countryCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching documents by country:', err)
      throw new Error('Unable to fetch documents by country. Please try again.')
    }
  }

  /**
   * Get documents by document type
   * @param docTypeCode - The document type code
   */
  async getDocumentsByDocType(docTypeCode: string): Promise<any[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/doc-type/${docTypeCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching documents by document type:', err)
      throw new Error('Unable to fetch documents by document type. Please try again.')
    }
  }
}