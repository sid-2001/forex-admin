// services/kycDocumentType.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

interface CreateDocumentTypePayload {
  kycDocTypeDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

interface UpdateDocumentTypePayload {
  kycDocTypeDescription: string
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

export class KycDocumentTypeService extends BaseService {
  private baseUrl = '/api/static-table/kyc-document-type-master'

  /**
   * Create a new KYC document type
   * @param payload - The document type data to create
   * @returns Promise with the created document type response
   */
  async createDocumentType(payload: CreateDocumentTypePayload): Promise<any> {
    try {
      const response = await api1.post(this.baseUrl, payload)
      return response
    } catch (err) {
      console.error('Error creating document type:', err)
      throw new Error('Unable to create document type. Please try again.')
    }
  }

  /**
   * Get all KYC document types
   * @returns Promise with array of all document types
   */
  async getAllDocumentTypes(): Promise<any[]> {
    try {
      const response = await api1.get(`/api/static-table/kyc-document-type-master/getAll`)
      console.log(response)
      return response.data || []
    } catch (err) {
      console.error('Error fetching document types:', err)
      throw new Error('Unable to fetch document types. Please try again.')
    }
  }

  /**
   * Get KYC document type by code
   * @param code - The document type code
   * @returns Promise with the document type data
   */
  async getDocumentTypeByCode(code: string): Promise<any> {
    try {
      const response = await api1.get(`${this.baseUrl}/${code}`)
      return response.data
    } catch (err) {
      console.error('Error fetching document type:', err)
      throw new Error('Unable to fetch document type. Please try again.')
    }
  }

  /**
   * Update KYC document type
   * @param code - The document type code to update
   * @param payload - The updated document type data
   * @returns Promise with the update response
   */
  async updateDocumentType(code: string, payload: UpdateDocumentTypePayload): Promise<any> {
    try {
      const response = await api1.put(`${this.baseUrl}/${code}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating document type:', err)
      throw new Error('Unable to update document type. Please try again.')
    }
  }

  /**
   * Update document type status (activate/deactivate)
   * @param id - The document type ID
   * @param active - New active status
   * @param modifiedBy - User performing the action
   * @returns Promise with the status update response
   */
  async updateStatus(id: string, active: boolean, modifiedBy: string): Promise<any> {
    try {
      const payload: UpdateStatusPayload = {
        id: id,
        active: active,
        modifiedBy: modifiedBy,
      }
      const response = await api1.put(`${this.baseUrl}/updateStatus`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating status:', err)
      throw new Error('Unable to update status. Please try again.')
    }
  }

  /**
   * Delete/deactivate document type
   * @param code - The document type code to delete/deactivate
   * @param permanent - Whether to permanently delete or just deactivate
   * @returns Promise with the delete response
   */
  async deleteDocumentType(code: string, permanent: boolean = false): Promise<any> {
    try {
      const response = await api1.del(`${this.baseUrl}/${code}/${permanent}`)
      return response.data
    } catch (err) {
      console.error('Error deleting document type:', err)
      throw new Error('Unable to delete document type. Please try again.')
    }
  }
}
