import { BaseService } from './base.service'
import api1 from './apis/api1'

export class AuditService extends BaseService {
  // async getAuditLogsListing(tableName: string, page: number, pagesize: number): Promise<any> {
  //   const url = `/api/transactions/auditLog/logs?tableName=${tableName}&page=${page}&size=${pagesize}&sortBy=event_time&sortDir=desc`
  //   try {
  //     const { data } = await api1.get(url)
  //     return data
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }
  async getAuditLogsListing(): Promise<any> {
    const url = 'api/kyc/kyc-request-audit-log/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getModulesListing(): Promise<any> {
    const url = 'api/static-table/module-feature-master/getAll'
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getAuditLogsListingDataViaModuleName(searchFilterStr: string): Promise<any> {
    const url = `api/static-table/master-audit-table/data?${searchFilterStr}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getfiltersDataByModuleName(moduleName: string): Promise<any> {
    const url = `api/static-table/master-audit-table/filters?moduleName=${moduleName}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
