import api1 from './apis/api1';

export interface CountryReportingMapping {
  id?: string;
  countryLabelCode: string;
  fieldLabelCode: string;
  requirementLevels: 'M' | 'O' | 'C'; // M-Mandatory, O-Optional, C-Conditional
  visibility: 'Y' | 'N';
  createdBy: string;
  modifiedBy?: string;
  active: boolean;
  effectiveFromDate: string;
  effectiveToDate: string;
  createdLocalDateTime?: string;
  createdTimezone?: string;
  createdOffset?: string;
  createdUtcDatetime?: string;
  modifiedLocalDateTime?: string | null;
  modifiedTimezone?: string | null;
  modifiedOffset?: string | null;
  modifiedUtcDatetime?: string | null;
}

export interface CountryLabelOption {
  countryLabelCode: string;
  countryCode: string;
  railPayoutMappingCode: string;
  countryReportingCode: string;
  displayName: string;
}

export interface FieldLabelOption {
  fieldLabelCode: string;
  fieldName: string;
  label: string;
  channelCode: string;
  screen: string;
  displayName: string;
}

export default class CountryReportingMappingsService {
  async getAll(): Promise<CountryReportingMapping[]> {
    try {
      const { data } = await api1.get('/api/static-table/country-reporting-mappings');
      return data || [];
    } catch (err) {
      console.error('Error fetching country reporting mappings:', err);
      return [];
    }
  }

  async getCountryLabelOptions(): Promise<CountryLabelOption[]> {
    try {
      // You'll need to create this API endpoint or adjust based on your data structure
      const { data } = await api1.get('/api/static-table/country-label-codes');
      return data.data || [];
    } catch (err) {
      console.error('Error fetching country label options:', err);
      return [];
    }
  }

  async getFieldLabelOptions(): Promise<FieldLabelOption[]> {
    try {
      // Get all field labels and format them for dropdown
      const { data } = await api1.get('/api/static-table/country-label-fields/getAll');
      const fields = data || [];
      return fields.map((field: any) => ({
        fieldLabelCode: field.fieldLabelCode,
        fieldName: field.fieldName,
        label: field.label,
        channelCode: field.channelCode,
        screen: field.screen,
        displayName: `${field.fieldLabelCode} - ${field.label} (${field.channelCode}/${field.screen})`
      }));
    } catch (err) {
      console.error('Error fetching field label options:', err);
      return [];
    }
  }

  async create(payload: Omit<CountryReportingMapping, 'id'>): Promise<{
    status: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await api1.post('/api/static-table/country-reporting-mappings', payload);
      return response.data;
    } catch (err: any) {
      console.error('Error creating country reporting mapping:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to create mapping'
      };
    }
  }

  async update(payload: CountryReportingMapping,id:any): Promise<{
    status: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await api1.put(`/api/static-table/country-reporting-mappings/${id}`, payload);
      return response.data;
    } catch (err: any) {
      console.error('Error updating country reporting mapping:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to update mapping'
      };
    }
  }

  async delete(id: string, activeStatus: boolean): Promise<{
    status: boolean;
    message: string;
  }> {
    try {
      const response = await api1.del(`/api/static-table/country-reporting-mappings/id/${id}/activeStatus/${activeStatus}`);
      return response.data;
    } catch (err: any) {
      console.error('Error deleting country reporting mapping:', err);
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to delete mapping'
      };
    }
  }
}