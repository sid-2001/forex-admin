import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { countyState } from "@/states/state";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { BankBusinessType } from "../services/bantypemaster.service";
import ForexCurrencyService, { ForexCurrency } from "../services/forex-currency.service";
import { DynamicDatePicker, DynamicEndDatePicker } from "@/helpers/DynamicDatePicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: BankBusinessType | null;
}

export default function BankTypeDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();
  const [countries] = useRecoilState(countyState);
  const forexCurrencyService = new ForexCurrencyService();

  const [currencies, setCurrencies] = useState<ForexCurrency[]>([]);
  const [form, setForm] = useState({
    countryCode: "",
    businessCurrencyCode: "INR",
    bankBusinessName: "",
    active: true,
    effective_from_date: "",
    effective_to_date: ""
  });

  const [errors, setErrors] = useState<any>({});

  /* ================= FETCH CURRENCIES ================= */
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await forexCurrencyService.getAll();
         setCurrencies(response);

      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };

    if (open) {
      fetchCurrencies();
    }
  }, [open]);

  /* ================= LOAD EDIT DATA ================= */
  useEffect(() => {
    if (editData) {
      setForm({
        //@ts-ignore
        countryCode: editData.countryCode,
        //@ts-ignore
        businessCurrencyCode: editData.businessCurrencyCode,
        //@ts-ignore
        bankBusinessName: editData.bankBusinessName,
        active: editData.active,
        effective_from_date: editData.effective_from_date?.split("T")[0],
        effective_to_date: editData.effective_to_date?.split("T")[0]
      });
    } else {
      setForm({
        countryCode: "",
        businessCurrencyCode: "INR",
        bankBusinessName: "",
        active: true,
        effective_from_date: "",
        effective_to_date: ""
      });
    }
    setErrors({});
  }, [editData, open]);

  /* ================= HANDLERS ================= */
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev: any) => ({ ...prev, [key]: "" }));
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors: any = {};

    if (!form.bankBusinessName.trim())
      newErrors.bankBusinessName = "Business name is required";

    if (!form.businessCurrencyCode)
      newErrors.businessCurrencyCode = "Currency is required";

    if (!form.countryCode)
      newErrors.countryCode = "Country is required";

    if (!form.effective_from_date)
      newErrors.effective_from_date = "Effective from date required";

    if (!form.effective_to_date)
      newErrors.effective_to_date = "Effective to date required";

    if (
      form.effective_from_date &&
      form.effective_to_date &&
      form.effective_to_date < form.effective_from_date
    ) {
      newErrors.effective_to_date =
        "Effective To must be after Effective From";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      ...form,
      created_by: localService.get_staff_id(),
      modified_by: editData ? localService.get_staff_id() : undefined,
      effective_from_date: `${form.effective_from_date}T00:00:00`,
      effective_to_date: `${form.effective_to_date}T23:59:59`
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Update Bank Type" : "Add Bank Type"}
      </DialogTitle>

      <DialogContent>
        {/* BUSINESS NAME */}
        <TextField
          label="Business Name"
          fullWidth
          required
          margin="dense"
          value={form.bankBusinessName}
          error={!!errors.bankBusinessName}
          helperText={errors.bankBusinessName}
          onChange={(e) =>
            handleChange("bankBusinessName", e.target.value)
          }
        />

        {/* CURRENCY - NOW FETCHED FROM API */}
        <InputLabel sx={{ mt: 2 }}>Currency</InputLabel>
        <Select
          fullWidth
          value={form.businessCurrencyCode}
          error={!!errors.businessCurrencyCode}
          onChange={(e) =>
            handleChange("businessCurrencyCode", e.target.value)
          }
        >
          {currencies
            ?.filter((c) => c.active)
            .map((currency) => (
              <MenuItem 
                key={currency.currencyCode} 
                value={currency.currencyCode}
              >
                {currency.currencyName} ({currency.currencyCode})
              </MenuItem>
            ))}
        </Select>
        {errors.businessCurrencyCode && (
          <p style={{ color: "#d32f2f", fontSize: 12 }}>
            {errors.businessCurrencyCode}
          </p>
        )}

        {/* COUNTRY */}
        <InputLabel sx={{ mt: 2 }}>Country</InputLabel>
        <Select
          fullWidth
          value={form.countryCode}
          error={!!errors.countryCode}
          onChange={(e) =>
            handleChange("countryCode", e.target.value)
          }
        >
          {countries
            ?.filter((c) => c.status === "A")
            .map((c) => (
              <MenuItem
              //@ts-ignore
              key={c.countryCode} value={c.countryCode}>
                {c.countryName}
              </MenuItem>
            ))}
        </Select>
        {errors.countryCode && (
          <p style={{ color: "#d32f2f", fontSize: 12 }}>
            {errors.countryCode}
          </p>
        )}




          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effective_from_date}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effective_from_date: val })
              }}
              minDate={new Date().toISOString().split('T')[0]}
              error={!!errors.effectiveFrom}
              helperText={errors.effectiveFrom}
              required
            />
          </Grid>
hjhjh
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effective_to_date}
              minDate={form.effective_to_date}
              onChange={(val: string) => {
                setForm({ ...form, effective_to_date: val })
              }}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo}
              required
            />
          </Grid>

        {/* EFFECTIVE FROM */}
        {/* <TextField
          type="date"
          label="Effective From"
          fullWidth
          required
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_from_date}
          error={!!errors.effective_from_date}
          helperText={errors.effective_from_date}
          onChange={(e) =>
            handleChange("effective_from_date", e.target.value)
          }
        /> */}

        {/* EFFECTIVE TO */}
        {/* <TextField
          type="date"
          label="Effective To"
          fullWidth
          required
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_to_date}
          error={!!errors.effective_to_date}
          helperText={errors.effective_to_date}
          inputProps={{ min: form.effective_from_date }}
          onChange={(e) =>
            handleChange("effective_to_date", e.target.value)
          }
        /> */}

        {/* ACTIVE */}
        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) =>
                handleChange("active", e.target.checked)
              }
            />
          }
          label="Active"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}