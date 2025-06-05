import React from 'react'

import { LocalStorageService } from '@/helpers/local-storage-service';

const Unauthorized = () => {
    return (<h2>Unauthorized Access</h2>)
}
 
const HasPermission: React.FC<any> = ({ module, permission, children }: { module: any, permission: string, children: any }) => {
    const local_service = new LocalStorageService();
    const permission_granted = local_service.get_staff_access()?.modules?.find((item: any) => item.moduleName === module);
    return permission_granted?.access[permission] ? children : <Unauthorized />
};

export default HasPermission;