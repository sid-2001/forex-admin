import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

interface CustomSnackbarProps {
  type: 'success' | 'error' | 'warning' | 'info'
  handleClose: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
  // return <Alert></Alert>
})

const CustomSnackbar = () => {

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000} // Auto hides after 3 seconds
      //   onClose={handleClose}ap
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position
    >
      <Alert
        //@ts-ignore
        severity={type}
        sx={{ width: '100%' }}
      >
        {text}
      </Alert>
    </Snackbar>
  )
}

export default CustomSnackbar
