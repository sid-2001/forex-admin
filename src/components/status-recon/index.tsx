import { Select, MenuItem, Box } from "@mui/material";

const colors = { settled: "green", error: "red", pending: "goldenrod" };

export default function StatusDropdown({ 
  //@ts-ignore
  value, onChange }) {
  return (
    <Select


     variant="outlined"
      sx={{
        border: "none",
        "& fieldset": {
          border: "none",
        },
        "&:hover fieldset": {
          border: "none",
        },
        "&.Mui-focused fieldset": {
          border: "none",
        },
        backgroundColor: "transparent", // optional, for a clean look
        minWidth: 120,
      }}
    labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      renderValue={(val) => (
        <Box sx={{ display: "flex", alignItems: "center",
        //@ts-ignore
        backgroundColor: colors[val] ,color:"white" }}>

          <Box sx={{ width: 10, height: 10, borderRadius: "50%", 
            //@ts-ignore
            bgcolor: colors[val],color:"white" }} />
          {val}
        </Box>
      )}
    >
      {Object.entries(colors).map(([key, color]) => (
        <MenuItem key={key} value={key}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color,color:"white" }} />
            {key}
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
