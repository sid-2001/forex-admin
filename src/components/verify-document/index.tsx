import React, { useState } from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, IconButton, TextField, Typography, Stack } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { Document, Page } from 'react-pdf'
import { Passport } from '@/assets/images'

const VerifyDocumentModal = (
   //@ts-ignore
  { open, onClose, sampledata }: { open: boolean; onClose: () => void }) => {
  const [fileType, setFileType] = useState<'pdf' | 'image'>('image') // Example type
  const [filePath, setFilePath] = useState('../../assets/images/passport.jpg') // Example file
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <strong>Verify Document</strong>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          marginBottom: '10px',
        }}
      >
        <Stack
          direction="row"
          gap={2}
          sx={{
            marginTop: '2%',
          }}
        >
          <TextField label="ID Type" value="Passport" sx={{ mb: 2 }} disabled />
          <TextField label="Verification Type" value="Auto" sx={{ mb: 2 }} disabled />
        </Stack>
        <Box display="flex" gap={2}>
          {/* Left Column */}
          <Box flex={1} border="1px solid #ccc" height={250} display="flex" justifyContent="center" alignItems="center">
            {fileType === 'pdf' ? (
              <Document file={filePath} onLoadError={(e) => console.error(e)}>
                <Page pageNumber={1} />
              </Document>
            ) : (
              <img src={Passport} alt="Document" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            )}
          </Box>

          {/* Right Column */}
          <Box flex={1}>
                  <Typography>
              <CloudDownloadIcon fontSize="small" />{' '}
              <a href={sampledata?.documentUrl} target="_blank" rel="noopener noreferrer">
                Download Document
              </a>
            </Typography>
          </Box>
        </Box>

        {/* Additional Comments */}
        <TextField label="Additional Comments" fullWidth multiline rows={3} sx={{ mt: 2 }} defaultValue="Verified" disabled />

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-start" gap={2} mt={2}>
          <Button variant="contained" color="success" disabled>
            close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default VerifyDocumentModal
