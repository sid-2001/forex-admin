import React from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { TransactionService } from "@/services/transaction.service";

import { Cashfree } from "cashfree-pg"; 



const CashfreePayment = ({ amount,data }: { amount: number,data:any }) => {

  let transaction_service=new TransactionService()

 transaction_service.createTransaction(data).then(res=>{
console.log(res)
  console.log(data.data)

 })

 
 
  const initiatePayment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/create-order", { amount });
      const { payment_session_id } = response.data;

      if (!payment_session_id) {
        alert("Failed to get session ID");
        return;
      }

      // Open the payment page in a new window
      // const paymentWindow = window.open("", "_blank", "width=600,height=800");

      // if (paymentWindow) {
        const htmlContent = ` <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cashfree Checkout</title>
    <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
</head>
<body>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const cashfree = Cashfree({ mode: "sandbox" });

            let checkoutOptions = {
                paymentSessionId: "${payment_session_id}",
                redirectTarget: "_self",
            };

            // Automatically trigger checkout when page loads
            cashfree.checkout(checkoutOptions);
        });
    </script>
</body>
</html>
      `;

        document.open();
      document.write(htmlContent);
      document.close();
      // } else {
      //   alert("Popup blocked! Please allow popups for this site.");
      // }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div>

<Button variant="outlined" color="primary" sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1, padding: "6px 16px" }} onClick={initiatePayment}>

<img
  src="https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_200_200/company-logo_200_200/0/1632367052546/cashfree_logo?e=1749081600&v=beta&t=sL4clktovuYkc63HKbm9-vhHI0HYzzTPiFwSMGtu1iM"
  alt="Ozow"
  style={{ height: "20px" }}
/>

Confirm & Pay
</Button>
{/* 
      <h2>Cashfree Payment</h2>
      <button onClick={initiatePayment}>Pay ₹{amount}</button> */}
    </div>
  );
};

export default CashfreePayment;
