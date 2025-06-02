import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

const ListCurrencies = () => {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCurrencies([
        { id: 1, country_code: "US", currency_code: "USD", currency: "Dollar", active: true },
        { id: 2, country_code: "IN", currency_code: "INR", currency: "Rupee", active: true },
        { id: 3, country_code: "GB", currency_code: "GBP", currency: "Pound", active: false },
        { id: 4, country_code: "EU", currency_code: "EUR", currency: "Euro", active: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns: GridColDef[] = [
    { field: "country_code", headerName: "Country Code", flex:1 },
    { field: "currency_code", headerName: "Currency Code", flex:1 },
    { field: "currency", headerName: "Currency", flex:1 },
    { field: "active", headerName: "Active", flex:1, type: "boolean" },
   
  ];

  return (
    <Box sx={{ height: '50vh', width: "70vw" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid 
        //@ts-ignore
        rows={currencies} columns={columns} pageSize={5} disableSelectionOnClick />
      )}
    </Box>
  );
};

export default ListCurrencies;
