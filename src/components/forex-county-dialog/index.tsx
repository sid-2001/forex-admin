// components/forex-country-dialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { ForexCountry } from "../../services/forextcoutnry.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: ForexCountry | null;
}

// Validation rules
const VALIDATION_RULES = {
  countryCode: { 
    max: 3, 
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters'
  },
  countryName: { 
    max: 100, 
    message: 'Country name cannot exceed 100 characters',
    required: true,
    min: 2,
    minMessage: 'Country name must be at least 2 characters'
  },
  countryPhoneCode: { 
    max: 6, 
    message: 'Phone code cannot exceed 6 characters',
    required: true,
    pattern: /^\+?[0-9]{1,4}$/,
    patternMessage: 'Phone code should be + followed by 1-4 digits (e.g., +91, +1)'
  },
  countryFlag: { 
    max: 50, 
    message: 'Flag identifier cannot exceed 50 characters',
    pattern: /^[a-z0-9_-]+$/i,
    patternMessage: 'Flag should contain only letters, numbers, underscores and hyphens'
  },
  countryFlagUrl: { 
    max: 500, 
    message: 'Flag URL cannot exceed 500 characters',
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    patternMessage: 'Please enter a valid URL'
  }
};

export default function ForexCountryDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();

  const [form, setForm] = useState<any>({
    countryCode: "",
    countryName: "",
    active: true, // Changed from status dropdown to active boolean
    countryFlag: "",
    countryFlagUrl: "",
    countryPhoneCode: ""
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editData && open) {
      // Convert status "A"/"I" to boolean active
      const activeStatus = editData.status === "A" || editData.active === true;
      
      setForm({
        countryCode: editData.countryCode || "",
        countryName: editData.countryName || "",
        active: activeStatus,
        countryFlag: editData.countryFlag || "",
        countryFlagUrl: editData.countryFlagUrl || "",
        countryPhoneCode: editData.countryPhoneCode || ""
      });
    } else if (open) {
      setForm({
        countryCode: "",
        countryName: "",
        active: true,
        countryFlag: "",
        countryFlagUrl: "",
        countryPhoneCode: ""
      });
    }
    setErrors({});
  }, [editData, open]);

  // Handle field change with error clearing
  const handleFieldChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    // Country Code validation
    if (!form.countryCode) {
      newErrors.countryCode = "Country code is required";
    } else {
      const code = form.countryCode.toUpperCase();
      if (code.length > VALIDATION_RULES.countryCode.max) {
        newErrors.countryCode = VALIDATION_RULES.countryCode.message;
      } else if (!VALIDATION_RULES.countryCode.pattern.test(code)) {
        newErrors.countryCode = VALIDATION_RULES.countryCode.patternMessage;
      }
    }

    // Country Name validation
    if (!form.countryName.trim()) {
      newErrors.countryName = "Country name is required";
    } else {
      const name = form.countryName.trim();
      if (name.length < VALIDATION_RULES.countryName.min) {
        newErrors.countryName = VALIDATION_RULES.countryName.minMessage;
      } else if (name.length > VALIDATION_RULES.countryName.max) {
        newErrors.countryName = VALIDATION_RULES.countryName.message;
      }
    }

    // Phone Code validation
    if (!form.countryPhoneCode) {
      newErrors.countryPhoneCode = "Phone code is required";
    } else {
      const phoneCode = form.countryPhoneCode.trim();
      if (phoneCode.length > VALIDATION_RULES.countryPhoneCode.max) {
        newErrors.countryPhoneCode = VALIDATION_RULES.countryPhoneCode.message;
      } else if (!VALIDATION_RULES.countryPhoneCode.pattern.test(phoneCode)) {
        newErrors.countryPhoneCode = VALIDATION_RULES.countryPhoneCode.patternMessage;
      }
    }

    // Country Flag validation (optional)
    if (form.countryFlag) {
      const flag = form.countryFlag.trim();
      if (flag.length > VALIDATION_RULES.countryFlag.max) {
        newErrors.countryFlag = VALIDATION_RULES.countryFlag.message;
      } else if (VALIDATION_RULES.countryFlag.pattern && !VALIDATION_RULES.countryFlag.pattern.test(flag)) {
        newErrors.countryFlag = VALIDATION_RULES.countryFlag.patternMessage;
      }
    }

    // Flag URL validation (optional)
    if (form.countryFlagUrl) {
      const url = form.countryFlagUrl.trim();
      if (url.length > VALIDATION_RULES.countryFlagUrl.max) {
        newErrors.countryFlagUrl = VALIDATION_RULES.countryFlagUrl.message;
      } else if (VALIDATION_RULES.countryFlagUrl.pattern && !VALIDATION_RULES.countryFlagUrl.pattern.test(url)) {
        newErrors.countryFlagUrl = VALIDATION_RULES.countryFlagUrl.patternMessage;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Convert boolean active to status for API compatibility if needed
    const payload = {
      countryCode: form.countryCode.toUpperCase(),
      countryName: form.countryName.trim(),
      countryPhoneCode: form.countryPhoneCode.trim(),
      countryFlag: form.countryFlag?.trim() || null,
      countryFlagUrl: form.countryFlagUrl?.trim() || null,
      active: form.active, // Use boolean for checkbox
      status: form.active ? "A" : "I", // For backward compatibility
      createdBy: localService.get_staff_id(),
      ...(editData && { modifiedBy: localService.get_staff_id() })
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
        {editData ? "Update Forex Country" : "Add Forex Country"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Country Code */}
          <Grid item xs={12}>
            <TextField
              label="Country Code"
              fullWidth
              required
              disabled={!!editData}
              value={form.countryCode}
              error={!!errors.countryCode}
              helperText={
                errors.countryCode || 
                `${form.countryCode.length}/${VALIDATION_RULES.countryCode.max} characters - Uppercase letters only`
              }
              onChange={(e) => handleFieldChange("countryCode", e.target.value.toUpperCase())}
              inputProps={{ 
                maxLength: VALIDATION_RULES.countryCode.max,
                style: { textTransform: 'uppercase' }
              }}
            />
          </Grid>

          {/* Country Name */}
          <Grid item xs={12}>
            <TextField
              label="Country Name"
              fullWidth
              required
              value={form.countryName}
              error={!!errors.countryName}
              helperText={
                errors.countryName || 
                `${form.countryName.length}/${VALIDATION_RULES.countryName.max} characters (min: ${VALIDATION_RULES.countryName.min})`
              }
              onChange={(e) => handleFieldChange("countryName", e.target.value)}
              inputProps={{ 
                maxLength: VALIDATION_RULES.countryName.max,
                minLength: VALIDATION_RULES.countryName.min
              }}
            />
          </Grid>

          {/* Phone Code */}
          <Grid item xs={12}>
            <TextField
              label="Phone Code"
              fullWidth
              required
              value={form.countryPhoneCode}
              error={!!errors.countryPhoneCode}
              helperText={
                errors.countryPhoneCode || 
                `${form.countryPhoneCode.length}/${VALIDATION_RULES.countryPhoneCode.max} characters - e.g., +91, +1`
              }
              onChange={(e) => handleFieldChange("countryPhoneCode", e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryPhoneCode.max }}
              placeholder="+91"
            />
          </Grid>

          {/* Country Flag */}
          <Grid item xs={12}>
            <TextField
              label="Country Flag Identifier"
              fullWidth
              value={form.countryFlag}
              error={!!errors.countryFlag}
              helperText={
                errors.countryFlag || 
                `${form.countryFlag.length}/${VALIDATION_RULES.countryFlag.max} characters - letters, numbers, underscore, hyphen only`
              }
              onChange={(e) => handleFieldChange("countryFlag", e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryFlag.max }}
              placeholder="e.g., us-flag, india-flag"
            />
          </Grid>

          {/* Flag URL */}
          <Grid item xs={12}>
            <TextField
              label="Flag URL"
              fullWidth
              value={form.countryFlagUrl}
              error={!!errors.countryFlagUrl}
              helperText={
                errors.countryFlagUrl || 
                `${form.countryFlagUrl.length}/${VALIDATION_RULES.countryFlagUrl.max} characters - valid URL`
              }
              onChange={(e) => handleFieldChange("countryFlagUrl", e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryFlagUrl.max }}
              placeholder="https://example.com/flag.png"
            />
          </Grid>

          {/* Active Checkbox (replacing dropdown) */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={form.active} 
                  onChange={(e) => handleFieldChange("active", e.target.checked)}
                  color="primary"
                />
              }
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
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}