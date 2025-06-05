import React from "react";
import Snackbar from "@mui/material/Snackbar";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "../../states/state";

const CustomSnackbar = () => {
  const [open, setOpen] = useRecoilState(alertState);
  const [text] = useRecoilState(alertTextState);
  const [type] = useRecoilState(alertTypeState); // "success", "error", "info", "warning"

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "info":
        return "#2196f3";
      default:
        return "#333";
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message={
        <span
          style={{
            width:"100%",
            backgroundColor: getBackgroundColor(type),
            padding: "8px 16px",
            borderRadius: 4,
            color: "#fff",
            fontWeight: 500,
            display: "inline-block",
          }}
        >
          {text}
        </span>
      }
    />
  );
};

export default CustomSnackbar;
