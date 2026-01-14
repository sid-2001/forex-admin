import StaticDataGrid from '@/components/static'
import { staticTableState } from '@/states/state'
import { useRecoilState } from 'recoil'
import { Box } from '@mui/material'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const StaticData = () => {
  // @ts-ignore
  const [staticTable] = useRecoilState(staticTableState)
  const local_service = new LocalStorageService()

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STATIC_DATA}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        {/* Data Grid */}
        {staticTable?.api && (
          <StaticDataGrid
            key={staticTable?.name}
            apiEndpoint={staticTable?.api}
            primaryKey={staticTable['primary-key']}
            title={staticTable?.listname}
            data={undefined}
          />
        )}
      </Box>
    </HasPermission>
  )
}

export default StaticData
