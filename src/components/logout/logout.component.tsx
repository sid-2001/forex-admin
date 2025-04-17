import React from 'react'
import { Box, Typography, Button, Modal } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

interface ConfirmationModalProps {
  // style: React.CSSProperties
  handleConfirm: () => void
  handleClose: () => void
  message: string
  isOpen: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message = '', handleClose, handleConfirm, isOpen }) => {
  return (<>
    <Modal open={isOpen} onClose={() => handleClose()}>
      <Box sx={{
        width: 400,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper'
      }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <LogoutIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Typography id="transition-modal-title" variant="h4" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
          Are you sure?
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={() => { handleConfirm() }}
          >
            Logout
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => { handleClose() }}
          >
            No
          </Button>
        </Box>
      </Box>
    </Modal>
  </>)
}

export default ConfirmationModal


