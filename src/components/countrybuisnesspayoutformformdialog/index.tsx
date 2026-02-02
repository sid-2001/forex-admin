import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import CountryBusinessPayoutPartnerService from "@/services/countryBusinessPayoutPartner.service";
import ProductBusinessCountryMappingService from "@/services/productBusinessCountryMapping.service";
import { LocalStorageService } from "@/helpers/local-storage-service";

interface Props {
  open: boolean;
  handleClose: () => void;
  editData?: any;
  refreshList: () => void;
}

const CountryBusinessPayoutPartnerFormDialog = ({
  open,
  handleClose,
  editData,
  refreshList,
}: Props) => {
  const CountryBusinessPayoutPartnerServic =
    new CountryBusinessPayoutPartnerService();

  const productBusinessService =
    new ProductBusinessCountryMappingService();
  const localService = new LocalStorageService();

  const [bussismessmapcode, setBussisnessmapcode] = useState<any[]>([]);
  const [selectedbussismessmapcode, setSelectedBussisnessmapcode] =
    useState<string>("");

  const [form, setForm] = useState<any>({
    businessTypeCode: "",
    payoutPartner: "",
    active: true,
    effective_from_date: "",
    effective_to_date: "",
  });

  const [errors, setErrors] = useState<any>({});

  /* ------------------ Fetch dropdown ------------------ */
  useEffect(() => {
    productBusinessService.getList().then((data: any[]) => {
      if (data?.length > 0) {
        setBussisnessmapcode(data);
      }
    });
  }, []);

  /* ------------------ Edit mode ------------------ */
  useEffect(() => {
    if (editData) {
      setSelectedBussisnessmapcode(
        editData.countryCorridorBusinessMapCode
      );
      setForm(editData);
    }
  }, [editData]);

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {};

    if (!selectedbussismessmapcode) {
      newErrors.countryCorridorBusinessMapCode =
        "Country Corridor Business Map Code is required";
    }

    if (!form.businessTypeCode?.trim()) {
      newErrors.businessTypeCode = "Business Type Code is required";
    }

    if (!form.payoutPartner?.trim()) {
      newErrors.payoutPartner = "Payout Partner is required";
    }

    if (!form.effective_from_date) {
      newErrors.effective_from_date = "Effective From Date is required";
    }

    if (!form.effective_to_date) {
      newErrors.effective_to_date = "Effective To Date is required";
    }

    if (
      form.effective_from_date &&
      form.effective_to_date &&
      new Date(form.effective_to_date) <
        new Date(form.effective_from_date)
    ) {
      newErrors.effective_to_date =
        "Effective To Date cannot be before Effective From Date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = async () => {
    if (!validate()) return;

    if (editData) {
      await CountryBusinessPayoutPartnerServic.update(
        editData.countryBusinessPayoutPartnerCode,
        {
          ...form,
          countryCorridorBusinessMapCode: selectedbussismessmapcode,
          modified_by: localService.get_staff_id(),
        }
      );
    } else {
      await CountryBusinessPayoutPartnerServic.create({
        ...form,
        countryCorridorBusinessMapCode: selectedbussismessmapcode,
        created_by: localService.get_staff_id(),
      });
    }

    refreshList();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Update" : "Create"} Country Business Payout Partner
      </DialogTitle>

      <DialogContent>
        {/* ----------- Country Corridor Map Code ----------- */}
        <Box mt={1}>
          <InputLabel required>
            Country Corridor Business Map Code
          </InputLabel>

          <Select
            fullWidth
            value={selectedbussismessmapcode}
            disabled={!!editData}
            onChange={(e) =>
              setSelectedBussisnessmapcode(e.target.value as string)
            }
            error={!!errors.countryCorridorBusinessMapCode}
          >
            {bussismessmapcode
              ?.filter((item) => item.active === true)
              .map((mapcode) => (
                <MenuItem
                  key={mapcode.businessMapCode}
                  value={mapcode.businessMapCode}
                >
                  <Typography>{mapcode.businessMapCode}</Typography>
                </MenuItem>
              ))}
          </Select>

          {errors.countryCorridorBusinessMapCode && (
            <FormHelperText error>
              {errors.countryCorridorBusinessMapCode}
            </FormHelperText>
          )}
        </Box>

        {/* ----------- Business Type Code ----------- */}
        <TextField
          label="Business Type Code"
          fullWidth
          required
          margin="dense"
          value={form.businessTypeCode}
          error={!!errors.businessTypeCode}
          helperText={errors.businessTypeCode}
          onChange={(e) =>
            setForm({ ...form, businessTypeCode: e.target.value })
          }
        />

        {/* ----------- Payout Partner ----------- */}
        <TextField
          label="Payout Partner"
          fullWidth
          required
          margin="dense"
          value={form.payoutPartner}
          error={!!errors.payoutPartner}
          helperText={errors.payoutPartner}
          onChange={(e) =>
            setForm({ ...form, payoutPartner: e.target.value })
          }
        />

        {/* ----------- Effective From ----------- */}
        <TextField
          type="datetime-local"
          label="Effective From"
          fullWidth
          required
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_from_date}
          error={!!errors.effective_from_date}
          helperText={errors.effective_from_date}
          onChange={(e) =>
            setForm({
              ...form,
              effective_from_date: e.target.value,
            })
          }
        />

        {/* ----------- Effective To ----------- */}
        <TextField
          type="datetime-local"
          label="Effective To"
          fullWidth
          required
          margin="dense"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: form.effective_from_date,
          }}
          value={form.effective_to_date}
          error={!!errors.effective_to_date}
          helperText={errors.effective_to_date}
          onChange={(e) =>
            setForm({
              ...form,
              effective_to_date: e.target.value,
            })
          }
        />

        {/* ----------- Active ----------- */}
        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
          }
          label="Active"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CountryBusinessPayoutPartnerFormDialog;
