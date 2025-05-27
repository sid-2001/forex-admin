import moment from 'moment-timezone';
import { LocalStorageService } from './local-storage-service';

export class HelperService {
  local_service = new LocalStorageService()
  roundToTwoFixed(num: any) {
    return (Math.round(num * 100) / 100).toFixed(2);
  }

  convertDateAndTime(date: any) {
    return moment(date).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }

  checkUserPermission(moduleName: string, action: string) {
    console.log(moduleName, action, "=========")
    const staffData = this.local_service.get_staff_access()
    console.log(staffData, "=---------------")
    return true;
  }
}


