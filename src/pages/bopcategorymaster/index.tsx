// import { useEffect, useState } from "react";
// import { Box, Button, IconButton, Stack } from "@mui/material";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import BopCategoryFormDialog from "../../components/bopcategorydialog";
// import BopCategoryService from "../../services/bop.category.service";
// import { LocalStorageService } from "@/helpers/local-storage-service";
// import { useRecoilState } from "recoil";
// import { alertState, alertTextState, alertTypeState } from "@/states/state";
// import BopCategoryTypeService from "@/services/bop.category.type.service";

// export interface BopCategory {
//   bopPurposeCategoryCode: string;
//   countryCode: string;
//   categoryType: string;
//   bopPurposeCode: string;
//   bopPurposeDescription: string;
//   bopPurposeSubCode: string;
//   bopPurposeSubDescription: string;
//   active: boolean;
//   effective_from_date: string;
//   effective_to_date: string;
// }

// export default function BopCategoryMaster() {
//   const [rows, setRows] = useState<BopCategory[]>([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editData, setEditData] = useState<BopCategory | null>(null);
//   const [categorylist, setCategorylist] = useState<BopCategory | null>(null);
//   // const [C]

//   const [open, setOpen] = useRecoilState(alertState);
//   const [text, setText] = useRecoilState(alertTextState);
//   const [type, setType] = useRecoilState(alertTypeState);

//   const service = new BopCategoryService();
//   const localService = new LocalStorageService();
//   const bopcategorytypeservice=new BopCategoryTypeService()

//   const fetchData = async () => {
//     const res = await service.getAll();
//     // if (res?.status) {

//       setRows(res);
//     // }
//   };
//    const fetchCategoryType = async () => {
//     const res = await service.getCategoryType();
//     // if (res?.status) {

//      console.log(res);
//     // }
//   };

//   useEffect(() => {

//          bopcategorytypeservice.getAll().then(data=>{

//             console.log(data)
//             setCategorylist(data)
//              fetchData();
//           })

//   }, []);

//   const handleCreate = async (data: any) => {
//     const res = await service.create({
//       ...data,
//       created_by: localService.get_staff_id(),
//     });

//     if (res?.status) {
//       setType("Success");
//       setText("BOP Category Created Successfully");
//     } else {
//       setType("Fail");
//       setText("Server Error");
//     }
//     setOpen(true);
//     setDialogOpen(false);
//     fetchData();
//   };

//   const handleUpdate = async (data: any) => {
//     const res = await service.update(data);

//     if (res?.status) {
//       setType("Success");
//       setText("BOP Category Updated Successfully");
//     } else {
//       setType("Fail");
//       setText("Server Error");
//     }
//     setOpen(true);
//     setEditData(null);
//     setDialogOpen(false);
//     fetchData();
//   };

//   const handleDelete = async (row: BopCategory) => {
//     await service.delete({
//       bopPurposeCategoryCode: row.bopPurposeCategoryCode,
//       countryCode: row.countryCode,
//     });
//     fetchData();
//   };

//   const columns: GridColDef[] = [
//     { field: "bopPurposeCategoryCode", headerName: "Category Code", flex: 0.6, headerClassName: 'super-app-theme--header'  },
//     { field: "countryCode", headerName: "Country", flex: 0.4 , headerClassName: 'super-app-theme--header' },
//     { field: "categoryType", headerName: "Category Type", flex: 0.6, headerClassName: 'super-app-theme--header'  },
//     { field: "bopPurposeCode", headerName: "Purpose Code", flex: 0.5, headerClassName: 'super-app-theme--header'  },
//     { field: "bopPurposeDescription", headerName: "Purpose Description", flex: 1, headerClassName: 'super-app-theme--header'  },
//     { field: "bopPurposeSubCode", headerName: "Sub Code", flex: 0.5 , headerClassName: 'super-app-theme--header' },
//     { field: "bopPurposeSubDescription", headerName: "Sub Description", flex: 1 , headerClassName: 'super-app-theme--header' },
//     {
//       field: "active",
//       headerName: "Active",
//       width: 120,
//       renderCell: (p) => (p.value ? "Yes" : "No"),
//        headerClassName: 'super-app-theme--header'
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 140,
//       renderCell: (params) => (
//         <>
//           <IconButton
//             onClick={() => {
//               setEditData(params.row);
//               setDialogOpen(true);
//             }}
//           >
//             <EditIcon />
//           </IconButton>

//         </>
//       ), headerClassName: 'super-app-theme--header'
//     },
//   ];

//   return (
//     <Box p={2} sx={{ width: "85vw" }}>
//       <Stack direction="row" justifyContent="space-between" mb={2}>
//         <Button
//           variant="contained"
//           onClick={() => {
//             setEditData(null);
//             setDialogOpen(true);
//           }}
//         >
//           Add BOP Category
//         </Button>
//       </Stack>

//       <DataGrid
//         rows={rows}
//         columns={columns}
//         getRowId={(row) => row.bopPurposeCategoryCode}
//         autoHeight
//         pageSizeOptions={[5, 10]}
//                 initialState={{
//     pagination: {
//       paginationModel: {
//         page: 0,
//         pageSize: 5,
//       },
//     },
//   }}
//       />

//       <BopCategoryFormDialog
//         open={dialogOpen}
//         editData={editData}
//         onClose={() => setDialogOpen(false)}
//         onSubmit={editData ? handleUpdate : handleCreate}
//         categorylist={categorylist}
//       />
//     </Box>
//   );
// }
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import BopCategoryFormDialog from '../../components/bopcategorydialog'
import BopCategoryService from '../../services/bop.category.service'
import BopCategoryTypeService from '@/services/bop.category.type.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'

export default function BopCategoryMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [categorylist, setCategorylist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new BopCategoryService(), [])
  const bopcategorytypeservice = useMemo(() => new BopCategoryTypeService(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getAll()
      // Ensure we handle both {data: []} and raw [] formats
      const data = Array.isArray(res) ? res : res?.data || []
      setRows(data)
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    bopcategorytypeservice.getAll().then((data) => {
      setCategorylist(Array.isArray(data) ? data : data?.data || [])
      fetchData()
    })
  }, [bopcategorytypeservice, fetchData])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))
  }, [rows, searchQuery])
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    console.log(format, 'dkjhbcvy')
    return dayjs(dateString).format(format.toUpperCase())
  }

  const columns: GridColDef[] = [
    { field: 'bopPurposeCategoryCode', headerName: 'Category Code', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.4, headerClassName: 'super-app-theme--header' },
    { field: 'categoryType', headerName: 'Type', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'bopPurposeDescription', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    },
    { field: 'active', headerName: 'Active', flex: 0.4, headerClassName: 'super-app-theme--header', renderCell: (p) => (p.value ? 'Yes' : 'No') },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setEditData(params.row)
            setDialogOpen(true)
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          // color: 'text.primary',
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Bop Category Master'.toUpperCase()}
      </Typography>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.bopPurposeCategoryCode}
        autoHeight
        // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        // pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
      />

      <BopCategoryFormDialog
        open={dialogOpen}
        editData={editData}
        categorylist={categorylist}
        onClose={() => setDialogOpen(false)}
        refreshList={fetchData}
        showAlert={(type: any, text: any) => {
          setType(type)
          setText(text)
          setOpen(true)
        }}
      />
    </Box>
  )
}
