import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'

const DocumentsListComponent = ({ documentRecords }: { documentRecords: any }) => {
  const docColumns = [
    {
      field: 'docCode',
      headerName: 'Document Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: () => <div style={{ color: 'green' }}>Uploaded</div>,
    },
    {
      field: 'actions',
      headerName: 'View',
      flex: 0.5,

      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => handleViewDocument(params.row.docUrl?.replace('http://164.90.252.179/', 'https://api.impronics.com/uat/'))}
          color="primary"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ]
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null)

  const handleViewDocument = (url: string) => {
    console.log(url)
    setSelectedDocUrl(
      url?.replace('http://164.90.252.179/', 'https://api.impronics.com/uat/').replace('http://64.227.139.142/', 'https://api.impronics.com/'),
    )
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDocUrl(null)
  }

  return (
    <Box sx={{ height: '70vh' }}>
      <DataGrid
        rows={documentRecords}
        columns={docColumns}
        getRowId={(row) => row.id || row.documentName + Math.random()}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            '& .super-app-theme--header': {
              backgroundColor: '#005099',
              color: 'white',
              fontWeight: 'bold',
            },
          },
        }}
      />

      {/* ✅ Document Viewer Modal */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {selectedDocUrl ? (
            selectedDocUrl.endsWith('.pdf') ? (
              <iframe src={selectedDocUrl} width="100%" height="600px" title="PDF Viewer" style={{ border: 'none' }} />
            ) : (
              <img
                src={selectedDocUrl}
                alt="Document"
                style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                onError={(e) => (e.currentTarget.src = '')}
              />
            )
          ) : (
            <Typography>No document selected.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DocumentsListComponent
