// import StaticDataGrid from '@/components/static'
// import { staticTableState } from '@/states/state'
// import { useRecoilState } from 'recoil'

// const StaticData = () => {
//   //@ts-ignore
//   const [staticTable, setStaticTable] = useRecoilState<{
//     name: string
//     'primary-key': string
//     api: string
//     listname: string
//     updatePrimaryKey: String
//   }>(
//     //@ts-ignore
//     staticTableState,
//   )

//   return (
//     <div style={{ padding: '20px' }}>
//       <StaticDataGrid data={[]} apiEndpoint={staticTable.api} primaryKey={staticTable['primary-key']} title={staticTable.listname} />
//     </div>
//   )
// }

// export default StaticData


import StaticDataGrid from '@/components/static'
import { staticTableState } from '@/states/state'
import { useRecoilState } from 'recoil'
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import static_list from '@/contants/static.data'

// const  StaticData = () => {
//   //@ts-ignore
//   const [staticTable, setStaticTable] = useRecoilState<{
//     name: string
//     'primary-key': string
//     api: string
//     listname: string
//     updatePrimaryKey: String
//   }>(
//     //@ts-ignore
//     staticTableState,
//   )

//   return (
//     <Box sx={{ padding: '20px' }}>
//       <Box
//         sx={{
//           '& .MuiDataGrid-row:nth-of-type(even)': {
//             backgroundColor: '#e3f2fd', // Light blue for alternate rows
//           },
//         }}
//       >
//         <StaticDataGrid
//           data={[]}
//           apiEndpoint={staticTable.api}
//           primaryKey={staticTable['primary-key']}
//           title={staticTable.listname}
//         />
//       </Box>
//     </Box>
//   )
// }
const StaticData = () => {
  // @ts-ignore
  const [staticTable, setStaticTable] = useRecoilState(staticTableState)

  const handleChange = (event: any) => {
    const selectedTable = static_list.find(
      (table: any) => table.name === event.target.value
    )
    if (selectedTable) {
      setStaticTable(selectedTable)
    }
  }

  return (
    
    <Box sx={{  width: '80vw', height: '70vh' }}>
        {staticTable?.listname && (
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {staticTable.listname}
      </Typography>
        )}
      {/* Dropdown */}
      <FormControl sx={{ mb:-5  ,width: '20%' , marginTop:'1%'}} >
        <InputLabel>Select Table</InputLabel>
        <Select
          value={staticTable?.name || ''}
          label="Select Table"
          onChange={handleChange}
        >
          {static_list.map((table: any) => (
            <MenuItem key={table.name} value={table.name}>
              {table.listname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Data Grid */}
      <Box
      >
        {staticTable?.api && (
          <StaticDataGrid
            key={staticTable.name} 
            apiEndpoint={staticTable.api}
            primaryKey={staticTable['primary-key']}
            title={staticTable.listname} data={undefined} />
        )}
      </Box>
    </Box>
  )
}

export default StaticData
