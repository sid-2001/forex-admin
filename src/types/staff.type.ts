export interface StaffAccess {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }
  
  export interface StaffModule {
    moduleId: number;
    moduleDescription: string;
    moduleStatus: boolean;
    access: StaffAccess;
  }
  
  export interface StaffProfile {
    staffId: string;
    staffFirstName: string;
    staffLastName: string;
    staffCountry: string;
    staffContactNumber: string;
    staffIdType: string;
    staffIdNumber: string;
    staffAddressLine1: string;
    staffAddressLine2: string;
    staffSuburb: string;
    staffCity: string;
    staffPostalCode: string;
    staffBranch: string;
    email: string;
    username: string;
    roleId: number;
    roleDescription: string;
    modules: StaffModule[];
    password:string;
  }
  