import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material"
import { useEffect, useState } from "react"

interface Props {
  open: boolean
  onStay: () => void
  onLogout: () => void
}

export default function InactivityWarningModal({ open, onStay, onLogout }: Props) {
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    if (!open) return

    setSeconds(10)

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open])

  return (
    <Dialog open={open}>
      <DialogTitle>
        ⏳ Session Expiring
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1">
          👋 Are you still there?
        </Typography>

        <Typography sx={{ mt: 2 }}>
          🔒 You will be logged out in <b>{seconds}</b> seconds.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={onStay}
        >
          ✅ Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  )
}