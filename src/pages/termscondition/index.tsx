import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TermsConditionsService, {
  TermsConditions
} from "../../services/termsandcondition.service";
import { countyState } from "@/states/state";
import { useRecoilState } from "recoil";
import staticdataService from "@/services/staticdata.service";
import { LocalStorageService } from "@/helpers/local-storage-service";
import ChannelService from "@/services/channel.servive";

const termsService = new TermsConditionsService();

/* ---------- HELPERS ---------- */
const parseJsonContent = (jsonContent: any) => {
  if (!jsonContent) return { editorData: [] };
  if (typeof jsonContent === "string") {
    try {
      return JSON.parse(jsonContent);
    } catch {
      return { editorData: [] };
    }
  }
  return jsonContent;
};

const cleanHtml = (html: string) =>
  html
    ?.replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim() || "";

/* ---------- QUILL TOOLBAR ---------- */
const QuillToolbar = () => (
  <div id="quill-toolbar">
    <select className="ql-header">
      <option value="1">H1</option>
      <option value="2">H2</option>
      <option value="3">H3</option>
      <option value="">Normal</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-link" />
    <button className="ql-clean" />
  </div>
);

export default function TermsConditionsGridPage() {
  const [rows, setRows] = useState<TermsConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TermsConditions | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('')
   const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [versions, setVersions] = useState<any[]>([]);
  const [editorValue, setEditorValue] = useState("");
 const [countries, setCountries] = useRecoilState(countyState)
  const [channels, setChannels] = useState([])
  const [form, setForm] = useState({
    countryCode: "",
    channel: "",
    screen: "",
    headerSectionCount: 0,
    contentCount: 0,
    version: "1.0",
    active: true,
    effectiveFromDate: "",
    effectiveToDate: "9999-12-31T00:00:00"
  });
  const local_service = new LocalStorageService()
    const userCountry = local_service?.get_staff_country()

  const static_service = new staticdataService()
  
  

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  const showSuccess = (msg: string) =>
    setSnackbar({ open: true, message: msg, severity: "success" });

  const showError = (msg: string) =>
    setSnackbar({ open: true, message: msg, severity: "error" });

  useEffect(() => {
    loadData();
    fetchchannel()
  }, []);


    const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      const countryCode = event.target.value as string
  
      setSelectedCountry(countryCode)
  
      // Find the selected country
      const selected = countries.find((country) => country.countryCode == countryCode)
      console.log('selected', selected)
  
      static_service.getCountryCurrency(selected?.countryCode).then((data) => {
        //@ts-ignore
  
        console.log(data)
        //@ts-ignore
        setCurrency(data?.currencyCode)
  
        if (selected) {
          console.log(userCurrency)
          console.log(data)
          transaction_service
            .getForexRate(
              //@ts-ignore
              userCurrency?.currencyCode,
              //@ts-ignore
              data?.currencyCode,
            )
            .then((data) => {
              console.log(data)
              setForexRate(data)
            })
          //@ts-ignore
          // setCurrency(selected.currency)
          //@ts-ignore
          
          setsendCountry(selected.countryCode)
          //@ts-ignore
          setSourceCountry(userCurrency?.currencyCode)
        }
      })
    }

       const handleChannelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      const channecode = event.target.value as string
  
     setSelectedChannel(channecode)
  
      // Find the selected country
      const selected = channels.find((country) => country.countryCode == countryCode)
      console.log('selected', selected)
  
      static_service.getCountryCurrency(selected?.countryCode).then((data) => {
        //@ts-ignore
  
        console.log(data)
        //@ts-ignore
        setCurrency(data?.currencyCode)
  
        if (selected) {
          console.log(userCurrency)
          console.log(data)
          transaction_service
            .getForexRate(
              //@ts-ignore
              userCurrency?.currencyCode,
              //@ts-ignore
              data?.currencyCode,
            )
            .then((data) => {
              console.log(data)
              setForexRate(data)
            })
          //@ts-ignore
          // setCurrency(selected.currency)
          //@ts-ignore
          
          setsendCountry(selected.countryCode)
          //@ts-ignore
          setSourceCountry(userCurrency?.currencyCode)
        }
      })
    }


  
  const loadData = async () => {
    try {
      setLoading(true);
      setRows(await termsService.getAll());
    } catch {
      showError("Failed to load Terms");
    } finally {
      setLoading(false);
    }
  };


  const fetchchannel = async () => {
    try {
      const channel_service=new ChannelService()
      setLoading(true);
      channel_service.getChannelList().then(data=>{
        console.log(data)
 setChannels(data.data)

      })
    
      // setRows(await termsService.getAll());
    } catch {
      showError("Failed to load Terms");
    } finally {
      setLoading(false);
    }
  };
  /* ---------- VIEW / EDIT ---------- */
  const handleView = (row: TermsConditions) => {
    const parsed = parseJsonContent(row.jsonContent);
    const active = parsed.editorData?.find((v: any) => v.active);

    setSelected(row);
    setVersions(parsed.editorData || []);
    setEditorValue(active ? cleanHtml(active.data) : "");

    setForm({
      countryCode: row.countryCode,
      channel: row.channel,
      screen: row.screen,
      headerSectionCount: row.headerSectionCount,
      contentCount: row.contentCount ?? 0,
      version: row.version,
      active: row.active,
      effectiveFromDate: row.effectiveFromDate,
      effectiveToDate: row.effectiveToDate
    });

    setOpen(true);
  };

  /* ---------- CREATE ---------- */
  const handleCreate = async () => {
    try {
      const payload = {
        ...form,
        jsonContent: JSON.stringify({
          editorData: [
            {
              id: "v1",
              data: cleanHtml(editorValue),
              active: true,
              updatedAt: new Date().toISOString()
            }
          ]
        }),
        createdBy: "ADMIN"
      };

      await termsService.create(payload);
      showSuccess("Terms created successfully");
      setOpen(false);
      loadData();
    } catch {
      showError("Create failed");
    }
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    if (!selected) return;

    try {
      const updatedVersions = versions.map(v => ({ ...v, active: false }));
      updatedVersions.push({
        id: `v${updatedVersions.length + 1}`,
        data: cleanHtml(editorValue),
        active: true,
        updatedAt: new Date().toISOString()
      });

      await termsService.update(selected.termsCode!, {
        ...selected,
        ...form,
        jsonContent: JSON.stringify({ editorData: updatedVersions }),
        modifiedBy: "ADMIN"
      });

      showSuccess("Terms updated");
      setOpen(false);
      loadData();
    } catch {
      showError("Update failed");
    }
  };

  /* ---------- GRID ---------- */
  const columns: GridColDef[] = [
    { field: "termsCode", headerName: "Terms Code", flex: 1 },
    { field: "countryCode", headerName: "Country", flex: 0.7 },
    { field: "channel", headerName: "Channel", flex: 0.6 },
    { field: "screen", headerName: "Screen", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: params => (
        <Button size="small" onClick={() => handleView(params.row)}>
          View / Edit
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ height: "100vh", p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Terms & Conditions</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelected(null);
            setVersions([]);
            setEditorValue("");
            setForm({
              countryCode: "",
              channel: "",
              screen: "",
              headerSectionCount: 0,
              contentCount: 0,
              version: "1.0",
              active: true,
              effectiveFromDate: "",
              effectiveToDate: "9999-12-31T00:00:00"
            });
            setOpen(true);
          }}
        >
          + Create Terms
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={r => r.termsCode!}
      />

      {/* ---------- DIALOG ---------- */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selected ? "Edit Terms" : "Create Terms"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <InputLabel>Destination Country</InputLabel>
                             <Select
                               value={selectedCountry}
                               //@ts-ignore
                               onChange={handleCountryChange}
                               displayEmpty
                             >
                               {
                                 //(userCountry === 'IN' ? countries : countries)
                                 countries
                                   ?.filter((item) => item.status === 'A' && item.countryCode !== userCountry)
                                   .map((country) => (
                                     <MenuItem
                                       //@ts-ignore
                                       key={country?.countryCode}
                                       value={country.countryCode}
                                     >
                                       <div style={{ display: 'flex', alignItems: 'center' }}>
                                         <Typography>{country?.countryName}</Typography>
                                       </div>
                                     </MenuItem>
                                   ))
                               }
                             </Select>
            <TextField
              label="Channel"
              value={form.channel}
              onChange={e => setForm({ ...form, channel: e.target.value })}
            />
            <TextField
              label="Screen"
              value={form.screen}
              onChange={e => setForm({ ...form, screen: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={e =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
              }
              label="Active"
            />

            <Divider />

            <QuillToolbar />
            <ReactQuill
              theme="snow"
              value={editorValue}
              onChange={setEditorValue}
              modules={{ toolbar: "#quill-toolbar" }}
              style={{ height: 250 }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={selected ? handleUpdate : handleCreate}
          >
            {selected ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
