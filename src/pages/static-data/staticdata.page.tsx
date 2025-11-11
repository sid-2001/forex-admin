import StaticDataGrid from '@/components/static'
import { staticTableState } from '@/states/state'
import { useRecoilState } from 'recoil'
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import static_list from '@/contants/static.data'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const StaticData = () => {
  // @ts-ignore
  const [staticTable, setStaticTable] = useRecoilState(staticTableState)
  const local_service = new LocalStorageService()

  const handleChange = (event: any) => {
    const selectedTable = static_list.find((table: any) => table.name === event.target.value)
    if (selectedTable) {
      setStaticTable(selectedTable)
    }
  }

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.STATIC_DATA}>
        {staticTable?.listname && (
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {staticTable.listname}
          </Typography>
        )}
        {/* Dropdown */}
        <FormControl sx={{ mb: -5, width: '20%', marginTop: '1%' }}>
          <InputLabel>Select Table</InputLabel>
          <Select value={staticTable?.name || ''} label="Select Table" onChange={handleChange}>
            {static_list.map((table: any) => (
              <MenuItem key={table.name} value={table.name}>
                {table.listname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Data Grid */}
        <Box>
          {staticTable?.api && (
            <StaticDataGrid
              key={staticTable.name}
              apiEndpoint={staticTable.api}
              primaryKey={staticTable['primary-key']}
              title={staticTable.listname}
              data={undefined}
            />
          )}
        </Box>
      </HasPermission>
    </Box>
  )
}

export default StaticData
