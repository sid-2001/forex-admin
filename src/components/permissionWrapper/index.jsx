import { LocalStorageService } from '@/helpers/local-storage-service';

const Unauthorized = () => {
    return <h2>Unauthorized Access</h2>;
}
const HasPermission = ({ module, permission, children }) => {
    const local_service = new LocalStorageService();
    const permission_granted = local_service.get_staff_access()?.specialAccessModules.find((item) => item.staffModuleDescription === module);
    return permission_granted?.access[permission] ? children : <Unauthorized />
};

export default HasPermission;