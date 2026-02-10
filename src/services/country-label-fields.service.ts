import api1 from './apis/api1';

export interface CountryLabelField {
  fieldLabelCode?: string;
  channelCode: string;
  screen: string;
  fieldName: string;
  label: string;
  description: string;
  minLength: number;
  maxLength: number;
  dataType: string;
  validationRequired: 'Y' | 'N';
  validationMessageMandatory: string;
  validationMessageOptional: string;
  validationRegex?: string;
  validationMessageError: string;
  createdBy: string;
  modifiedBy?: string;
  active?: boolean;
  effectiveFromDate?: string | null;
  effectiveToDate?: string | null;
  createdLocalDateTime?: string;
  createdTimezone?: string;
  createdOffset?: string;
  createdUtcDatetime?: string;
  modifiedLocalDateTime?: string | null;
  modifiedTimezone?: string | null;
  modifiedOffset?: string | null;
  modifiedUtcDatetime?: string | null;
}

export default class CountryLabelFieldsService {
  async getAll(): Promise<CountryLabelField[]> {
    try {
      const { data } = await api1.get('/api/static-table/country-label-fields/getAll');
      return data || [];
    } catch (err) {
      console.error('Error fetching country label fields:', err);
      return [];
    }
  }

  async getById(fieldLabelCode: string): Promise<CountryLabelField | null> {
    try {
      const { data } = await api1.get(`/api/static-table/country-label-fields/${fieldLabelCode}`);
      return data;
    } catch (err) {
      console.error('Error fetching country label field by ID:', err);
      return null;
    }
  }

  async create(payload: Omit<CountryLabelField, 'fieldLabelCode'>): Promise<{
    status: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await api1.post('/api/static-table/country-label-fields', payload);
      return response.data;
    } catch (err: any) {
      console.error('Error creating country label field:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to create field'
      };
    }
  }

  async update(fieldLabelCode: string, payload: Partial<CountryLabelField>): Promise<{
    status: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await api1.put(`/api/static-table/country-label-fields/${fieldLabelCode}`, payload);
      return response.data;
    } catch (err: any) {
      console.error('Error updating country label field:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to update field'
      };
    }
  }

  async delete(fieldLabelCode: string): Promise<{
    status: boolean;
    message: string;
  }> {
    try {
      const response = await api1.del(`/api/static-table/country-label-fields/${fieldLabelCode}`);
      return response.data;
    } catch (err: any) {
      console.error('Error deleting country label field:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to delete field'
      };
    }
  }
}