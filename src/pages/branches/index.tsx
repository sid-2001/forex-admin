import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { LocationOn, CheckCircle, Cancel } from '@mui/icons-material';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3c72',
    },
    secondary: {
      main: '#2a5298',
    },
  },
});

const ForexBranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.impronics.com/uat/api/static-table/forex-branch-code/listByCountryCode?countryCode=ZA'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch branch data');
        }
        
        const data = await response.json();
        setBranches(data);
        setError(null);
      } catch (err:any) {
        setError(err.message);
        console.error('Error fetching branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Define columns for DataGrid
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'city',
      headerName: 'City',
      width: 200,
      flex: 1,
    },
    {
      field: 'branchCode',
      headerName: 'Branch Code',
      width: 150,
      renderCell: (params:any) => (
        <Chip
          label={params.value}
          color="primary"
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params:any) => (
        <Chip
          icon={params.value ? <CheckCircle /> : <Cancel />}
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      width: 100,
    },
  ];

  return (


    <Box width='82vw'>
        <Typography variant="h4" gutterBottom color="primary">
          Branch Locations
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage and view all forex branch locations
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && branches.length > 0 && (
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={branches}
              //@ts-ignore
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(
                //@ts-ignore
                newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 20, 50]}
              pagination
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontSize: '1rem',
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: 2,
                  backgroundColor: 'background.default',
                },
              }}
            />
          </Paper>
        )}

        {!loading && !error && branches.length === 0 && (
          <Alert severity="info">
            No branch data available.
          </Alert>
        )}
     </Box>
   
  );
};

export default ForexBranchesPage;