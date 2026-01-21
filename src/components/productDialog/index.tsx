import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Box } from '@mui/material'
import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
}

export default function ProductFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')

  useEffect(() => {
    if (editData) {
      setProductCode(editData.productCode || '')
      setProductName(editData.productName || '')
      setActive(editData.active ?? true)
      setEffectiveFromDate(editData.effectiveFromDate ? editData.effectiveFromDate.split('T')[0] : '')
      setEffectiveToDate(editData.effectiveToDate ? editData.effectiveToDate.split('T')[0] : '')
    } else {
      setProductCode('')
      setProductName('')
      setActive(true)
      setEffectiveFromDate('')
      setEffectiveToDate('')
    }
  }, [editData, open])

  const handleSubmit = () => {
    onSubmit({
      productCode,
      productName,
      active,
      effectiveFromDate: effectiveFromDate ? `${effectiveFromDate}T00:00:00` : null,
      effectiveToDate: effectiveToDate ? `${effectiveToDate}T00:00:00` : null,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Update Product' : 'Create New Product'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <TextField
            label="Product Code"
            fullWidth
            margin="dense"
            variant="outlined"
            value={productCode}
            disabled={!!editData}
            onChange={(e) => setProductCode(e.target.value.toUpperCase())}
            placeholder="e.g., RMOW"
          />

          <TextField
            label="Product Name"
            fullWidth
            margin="dense"
            variant="outlined"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Remittance - Outward"
          />

          <TextField
            type="date"
            label="Effective From"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
          />

          <TextField
            type="date"
            label="Effective To"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
          />

          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} color="primary" />}
            label="Active Status"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!productCode || !productName}>
          {editData ? 'Update Product' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
