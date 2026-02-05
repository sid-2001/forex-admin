import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Autocomplete,
  createFilterOptions,
  Box,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

// Custom filter to search by both Name and Code
const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function BankTypeDialog({ open, onClose, onSubmit, editData }: any) {
  const localService = new LocalStorageService()
  const [countries] = useRecoilState(countyState)
  const [errors, setErrors] = useState<any>({})

  const [form, setForm] = useState<any>({
    countryCode: '',
    businessCurrencyCode: 'INR',
    bankBusinessName: '',
    active: true,
    effective_from_date: '',
    effective_to_date: '',
  })

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effective_from_date || editData.effectivefromdate || ''
      const tDate = editData.effective_to_date || editData.effectivetodate || ''

      setForm({
        countryCode: editData.countryCode || '',
        businessCurrencyCode: editData.businessCurrencyCode || 'INR',
        bankBusinessName: editData.bankBusinessName || '',
        active: editData.active ?? true,
        effective_from_date: fDate.split('T')[0],
        effective_to_date: tDate.split('T')[0],
      })
    } else {
      setForm({
        countryCode: '',
        businessCurrencyCode: 'INR',
        bankBusinessName: '',
        active: true,
        effective_from_date: '',
        effective_to_date: '',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.bankBusinessName?.trim()) newErrors.bankBusinessName = 'Required'
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.effective_from_date) newErrors.effective_from_date = 'Required'
    if (!form.effective_to_date) newErrors.effective_to_date = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (new Date(form.effective_to_date) < new Date(form.effective_from_date)) {
      onSubmit({ validationError: 'End Date cannot be less than Start Date' })
      return
    }

    onSubmit({
      ...form,
      created_by: localService.get_staff_id(),
      modified_by: editData ? localService.get_staff_id() : undefined,
      effective_from_date: `${form.effective_from_date}T00:00:00.000Z`,
      effective_to_date: `${form.effective_to_date}T23:59:59.000Z`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Bank Type' : 'Add Bank Type'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Business Name"
              fullWidth
              required
              value={form.bankBusinessName}
              onChange={(e) => setForm({ ...form, bankBusinessName: e.target.value })}
              error={!!errors.bankBusinessName}
              helperText={errors.bankBusinessName}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Searchable Country Selector */}
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              // Find the full country object based on the code stored in state
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Currency"
              fullWidth
              value={form.businessCurrencyCode}
              onChange={(e) => setForm({ ...form, businessCurrencyCode: e.target.value.toUpperCase() })}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effective_from_date}
              onChange={(e) => setForm({ ...form, effective_from_date: e.target.value })}
              error={!!errors.effective_from_date}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effective_to_date}
              onChange={(e) => setForm({ ...form, effective_to_date: e.target.value })}
              error={!!errors.effective_to_date}
              inputProps={{ min: form.effective_from_date }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
