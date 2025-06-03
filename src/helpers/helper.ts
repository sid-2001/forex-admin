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

  checkUserHasPermission(module: string, permission: string) {
    const permission_granted = this.local_service.get_staff_access()?.modules.find((item:any) => item.moduleName === module);
    return permission_granted?.access[permission] ? true : false;
  }

}


