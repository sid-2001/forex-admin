import React from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { TransactionService } from "@/services/transaction.service";

import { Cashfree } from "cashfree-pg";
import { useRecoilState } from "recoil";
import { selectedCountryState } from "@/states/state";
import { HelperService } from "@/helpers/helper";
import { LocalStorageService } from "@/helpers/local-storage-service";

const { VITE_APP_BACKEND } = import.meta.env
const helper = new HelperService();
const local_service = new LocalStorageService();

const CashfreePayment = ({ amount, data }: { amount: number, data: any }) => {

  let transaction_service = new TransactionService()

  const [selectedCountryoption, setSelectedCountryoption] = useRecoilState(selectedCountryState)

  const initiatePayment = async () => {
    try {
      const response = await axios.post(`${VITE_APP_BACKEND}/api/create-order`, { amount });
      const { payment_session_id } = response.data;

      let deal_data = await transaction_service.createDealcover({
        sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",
        destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        destinationCountry: selectedCountryoption == 'SA' ? "IN" : "ZA",
        applicantId: data?.applicant?.applicantId as any,
        rate: Number(data.forex)
      })

      if (deal_data.dealNumber) {
        await transaction_service.createTransaction(data).then(res => {
          console.log(res)
        })
      }

      if (!payment_session_id) {
        alert("Failed to get session ID");
        return;
      }

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


      //   document.open();
      // document.write(htmlContent);
      // document.close()


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
      <Button variant="outlined" color="primary"
        sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1, padding: "6px 16px" }}
        disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
        onClick={initiatePayment}>
        <img
          src="https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_200_200/company-logo_200_200/0/1632367052546/cashfree_logo?e=1749081600&v=beta&t=sL4clktovuYkc63HKbm9-vhHI0HYzzTPiFwSMGtu1iM"
          alt="Ozow"
          style={{ height: "20px" }}
        />
        Confirm & Pay
      </Button>
    </div>
  );
};

export default CashfreePayment;
