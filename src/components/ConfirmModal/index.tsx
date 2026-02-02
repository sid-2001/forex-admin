import React from 'react'
import { Dialog, DialogContent, Stack, Typography, Button, Box, Grow } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

// Using MUI's built-in Grow transition for that "pop" effect
const Transition = React.forwardRef(function Transition(props: any, ref: React.Ref<unknown>) {
  return <Grow ref={ref} {...props} />
})

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  type?: 'delete' | 'warning'
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  type = 'delete',
}: ConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          width: '350px',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogContent>
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              backgroundColor: type === 'delete' ? '#ffebee' : '#fffde7',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            {type === 'delete' ? (
              <DeleteForeverIcon sx={{ color: '#ef5350', fontSize: 40 }} />
            ) : (
              <WarningAmberIcon sx={{ color: '#fbc02d', fontSize: 40 }} />
            )}
          </Box>

          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            {message}
          </Typography>

          <Stack direction="row" spacing={2} width="100%" sx={{ pt: 2 }}>
            <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              color={type === 'delete' ? 'error' : 'warning'}
              onClick={onConfirm}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 0,
                '&:hover': { boxShadow: 0, backgroundColor: type === 'delete' ? '#d32f2f' : '#f9a825' },
              }}
            >
              Confirm
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
