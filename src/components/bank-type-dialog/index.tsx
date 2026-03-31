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
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import ForexCurrencyService, { ForexCurrency } from '../../services/forex-currency.service'

// Custom filter to search by both Name and Code
const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

// Custom filter for currencies to search by both Name and Code
const currencyFilter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: ForexCurrency) => `${o.currencyName} ${o.currencyCode}`,
})

export default function BankTypeDialog({ open, onClose, onSubmit, editData }: any) {
  const localService = new LocalStorageService()
  const forexCurrencyService = new ForexCurrencyService()
  const [countries] = useRecoilState(countyState)
  const [errors, setErrors] = useState<any>({})
  const [currencies, setCurrencies] = useState<ForexCurrency[]>([])

  const [form, setForm] = useState<any>({
    countryCode: '',
    businessCurrencyCode: 'INR',
    bankBusinessName: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  console.log(editData, 'editData')

  /* ================= FETCH CURRENCIES ================= */
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await forexCurrencyService.getAll()
        setCurrencies(response)
      } catch (error) {
        console.error('Error fetching currencies:', error)
      }
    }

    if (open) {
      fetchCurrencies()
    }
  }, [open])

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effectiveFromDate || editData.effectivefromdate || ''
      const tDate = editData.effectiveToDate || editData.effectivetodate || ''

      setForm({
        countryCode: editData.countryCode || '',
        businessCurrencyCode: editData.businessCurrencyCode || 'INR',
        bankBusinessName: editData.bankBusinessName || '',
        active: editData.active ?? true,
        effectiveFromDate: fDate.split('T')[0],
        effectiveToDate: tDate.split('T')[0],
      })
    } else {
      setForm({
        countryCode: '',
        businessCurrencyCode: 'INR',
        bankBusinessName: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.bankBusinessName?.trim()) newErrors.bankBusinessName = 'Required'
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.businessCurrencyCode) newErrors.businessCurrencyCode = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
      onSubmit({ validationError: 'End Date cannot be less than Start Date' })
      return
    }

    onSubmit({
      ...form,
      createdBy: localService.get_staff_id(),
      modifiedBy: editData ? localService.get_staff_id() : undefined,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00.000Z`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00.000Z`,
    })
  }
  console.log(
    currencies?.filter((c: ForexCurrency) => c.active),
    'sjbxschvhscvh',
    currencies,
  )
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
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, bankBusinessName: value })

                if (!/^[A-Za-z\s]+$/.test(value)) {
                  setErrors({
                    ...errors,
                    bankBusinessName: 'Only alphabets allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    bankBusinessName: '',
                  })
                }
              }}
              error={!!errors.bankBusinessName}
              helperText={errors.bankBusinessName}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Searchable Country Selector */}
            <Autocomplete
              disabled={!!editData}
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Searchable Currency Selector */}
            <Autocomplete
              options={currencies?.filter((c: ForexCurrency) => c.active) || []}
              filterOptions={currencyFilter}
              getOptionLabel={(o: ForexCurrency) => `${o.currencyName} (${o.currencyCode})`}
              value={currencies?.find((c: ForexCurrency) => c.currencyCode === form.businessCurrencyCode) || null}
              onChange={(_, val) => setForm({ ...form, businessCurrencyCode: val ? val.currencyCode : '' })}
              renderInput={(p) => (
                <TextField {...p} label="Currency" required error={!!errors.businessCurrencyCode} helperText={errors.businessCurrencyCode} />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effectiveFromDate: val })
              }}
              minDate={new Date().toISOString().split('T')[0]}
              error={!!errors.effectiveFromDate} // Changed from effective_from_date
              helperText={errors.effectiveFromDate} // Changed from effective_from_date
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
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
