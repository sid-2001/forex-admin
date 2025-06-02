import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, IconButton, Button, Modal, Grid, TextField, Switch } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DeleteOutline } from '@mui/icons-material'
import { UserService } from '@/services/user.service'

const user_service = new UserService();

const AddModuleDialog: React.FC<any> = ({ action = "Add", handleClose, handleSubmit, isOpen }) => {

    const [moduleData, setModuleData] = useState<any>({})
    const inputLabelStyle = {
        color: "black", textDecoration: "bold",
        fontWeight: 800, fontStyle: "bold"
    }

    const handleAddModule = async () => {
        try {
            const response = await user_service.createModule(moduleData)
            setModuleData({})
            handleSubmit({ ...response })
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
        const { name, value } = e.target
        setModuleData((prev: any) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleCancelBtn = () => {
        handleClose()
        setModuleData({})
    }
    return (<Modal open={isOpen} onClose={() => { handleClose() }}>
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 600,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
            }}
        >
            <Typography variant="h4" gutterBottom>
                {action} Module
            </Typography>
            <Box mt={4}>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={12}>
                        <label style={inputLabelStyle}>Module Name</label>
                        <TextField
                            value={moduleData?.moduleName || ""}
                            onChange={handleChange}
                            fullWidth
                            name="moduleName"
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <label style={inputLabelStyle}>Module Description</label>
                        <TextField
                            value={moduleData?.moduleDescription || ""}
                            onChange={handleChange}
                            fullWidth
                            name="moduleDescription"
                            rows={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <label style={inputLabelStyle}>Module Link</label>
                        <TextField
                            value={moduleData?.moduleLink || ""}
                            onChange={handleChange}
                            fullWidth
                            name="moduleLink"
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: "flex-end" }}>
                <Button variant="contained" color="primary"
                    fullWidth onClick={() => handleAddModule()} sx={{ mt: 2 }}>
                    Submit
                </Button>

                <Button variant="outlined"
                    fullWidth onClick={() => handleCancelBtn()} sx={{ mt: 2, ml: 2 }}>
                    Close
                </Button>
            </Box>

        </Box>
    </Modal>)
}

const ModuleTable: React.FC = () => {
    const [moduleData, setModuleData] = useState<any>([])
    const [isModalOpen, setIsModalOpen] = useState(false);

    const helper = new HelperService()
    const local_service = new LocalStorageService()

    const MODULE_COLUMNS = [
        {
            field: 'moduleName',
            headerName: 'Module Name',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'moduleDescription',
            headerName: 'Module Description',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'moduleLink',
            headerName: 'Module Link',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'moduleStatus',
            headerName: 'Active/Inactive',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            renderCell: (params: any) => {
                return <div>{params.row.moduleStatus ? 'Active' : 'Inactive'}</div>
            }
        },
        {
            field: "moduleCreatedDate",
            headerName: "Date",
            flex: 1,
            headerClassName: "super-app-theme--header",
            renderCell: (params: any) => {
                return helper.convertDateAndTime(params.row.moduleCreatedDate);
            }
        },
        {
            field: 'id1',
            headerName: 'Action',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            renderCell: (params: any) => (
                <IconButton onClick={() => {
                    // delete api call
                    // handleDeleteModuleApi()
                }}>
                    <DeleteOutline style={{
                        cursor: 'pointer',
                    }} />
                </IconButton>
            ),
        },
    ]

    useEffect(() => {
        fetchModuleListingData()
    }, [])

    const fetchModuleListingData = async () => {
        try {
            const response: any = await user_service.getAllModulesData()
            setModuleData(response)
        }
        catch (error) {
            console.error('There was a problem with the fetch operation:', error)
        }
    }

    const handleAddNewModule = (data: any) => {
        setModuleData([...moduleData, data])
        setIsModalOpen(false);
    }

    return (
        <HasPermission permission={'canRead'} module={local_service.get_modules()?.MODULE}>
        <Box sx={{ width: '85vw', height: '80vh' }}>
            <div style={{ textAlign: 'end' }}>
                <Button variant="outlined" 
                disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MODULE,'canCreate')}
                onClick={() => { setIsModalOpen(true) }}>Add Module</Button>
            </div>
            <DataGrid
                sx={{
                    marginTop: '20px',
                    width: '100%',
                    '& .MuiDataGrid-columnHeaders': {
                        '& .super-app-theme--header': {
                            backgroundColor: '#005099',
                            color: 'white',
                        },
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-cell': {
                        fontSize: '14px',
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: '#f0f8ff',
                    },
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                        backgroundColor: '#ffffff',
                    },
                    '& .super-app-theme--header': {
                        fontSize: '16px',
                    },
                }}
                columns={MODULE_COLUMNS}
                rows={moduleData}
                //@ts-ignore
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row: any) => row.moduleId} // Ensure proper row ID handling
            />
            {isModalOpen && <AddModuleDialog isOpen={isModalOpen} handleClose={() => {
                setIsModalOpen(false)
            }}
                handleSubmit={(response: any) => { handleAddNewModule(response) }}
            />}
        </Box>
         </HasPermission>

    )
}

export default ModuleTable
