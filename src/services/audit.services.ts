import { BaseService } from './base.service'
import api1 from './apis/api1'

export class AuditService extends BaseService {
  async getAuditLogsListing(tableName: string): Promise<any> {
    const url = `/api/transactions/auditLog/logs?tableName=${tableName}&page=1&size=20&sortBy=event_time&sortDir=desc`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
