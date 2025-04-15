import moment from 'moment-timezone';

export class HelperService {
  roundToTwoFixed(num: any) {
    return (Math.round(num * 100) / 100).toFixed(2);
  }

  convertDateAndTime(date: any) {
    return moment(date).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }
}


