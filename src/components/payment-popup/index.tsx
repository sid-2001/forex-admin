import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Button } from "@mui/material";

const PaymentPopup: React.FC = (
  
  //@ts-ignore
  {open,setOpen,url}) => {

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(()=>{
  },[])

  return (
    <div>
     

      {/* Popup Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent style={{ padding: 0 }}>
          <iframe
            src={url}
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPopup;
