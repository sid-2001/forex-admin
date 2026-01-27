import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
export interface BopCategoryType {
  bopCategoryTypeCode: string;
  bopCategoryType: string;
  bopCategoryDescription: string;
  active: boolean;
  effective_from_date: string;
  effective_to_date: string;
}

interface Props {
  open: boolean;
  editData: BopCategoryType | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const BopCategoryTypeFormDialog: React.FC<Props> = ({
  open,
  editData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    bopCategoryType: "",
    bopCategoryDescription: "",
    active: true,
    effective_from_date: "",
    effective_to_date: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        bopCategoryType: editData.bopCategoryType,
        bopCategoryDescription: editData.bopCategoryDescription,
        active: editData.active,
        effective_from_date: editData.effective_from_date?.slice(0, 10),
        effective_to_date: editData.effective_to_date?.slice(0, 10),
      });
    } else {
      setFormData({
        bopCategoryType: "",
        bopCategoryDescription: "",
        active: true,
        effective_from_date: "",
        effective_to_date: "",
      });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      effective_from_date: `${formData.effective_from_date}T00:00:00`,
      effective_to_date: `${formData.effective_to_date}T23:59:59`,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editData ? "Edit BOP Category Type" : "Create BOP Category Type"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              label="Category Type"
              name="bopCategoryType"
              fullWidth
              required
              value={formData.bopCategoryType}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Category Description"
              name="bopCategoryDescription"
              fullWidth
              value={formData.bopCategoryDescription}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Effective From"
              type="date"
              name="effective_from_date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.effective_from_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Effective To"
              type="date"
              name="effective_to_date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.effective_to_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BopCategoryTypeFormDialog;
