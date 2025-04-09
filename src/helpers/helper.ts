export class HelperService {


  roundToTwoFixed(num:any) {
    return (Math.round(num * 100) / 100).toFixed(2);
  }


}