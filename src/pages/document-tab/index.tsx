import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import Passport from '../../assets/images/Passport_card.jpg';

const DocumentComponent = () => {
  return (
    <Box sx={{ width: "80vw" }}>
      <Grid container spacing={4}>
        {/* Box 1: Image and ID Proof Information */}
        <Grid item xs={12} sm={4} marginTop={1}>
          <Paper sx={{ padding: 2, border: '2px dotted #0061B1', marginBottom: 4, display: 'flex', flexDirection: 'column' }}>
           <Paper sx={{display:'flex'}}>
  
            <Typography variant="body1" sx={{  marginInline:1 }}>
              <strong>ID Type:</strong>
            </Typography>
            <Typography variant="body1" sx={{ color:'blue',marginBottom: 2 }}>
              Passport
            </Typography>
            </Paper>
      
            <img
              src={Passport} 
              alt="ID Proof"
              style={{ maxWidth: '100%', height: 'auto', marginBottom: 2 }}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Passport Number:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  A12345678
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Expiry Date:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  12/12/2025
                </Typography>
              </Grid>
            </Grid>

            <Grid container sx={{ marginTop: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Issuing Authority:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  Government of Country
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Box 2: Image and ID Proof Information */}
        <Grid item xs={12} sm={4} marginTop={1}>
          <Paper sx={{ padding: 2, border: '2px dotted #0061B1', marginBottom: 4, display: 'flex', flexDirection: 'column' }}>
           <Paper sx={{display:'flex'}}>
  
            <Typography variant="body1" sx={{  marginInline:1 }}>
              <strong>ID Type:</strong>
            </Typography>
            <Typography variant="body1" sx={{ color:'blue',marginBottom: 2 }}>
              Passport
            </Typography>
            </Paper>
      
            <img
              src={Passport} 
              alt="ID Proof"
              style={{ maxWidth: '100%', height: 'auto', marginBottom: 2 }}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Passport Number:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  A12345678
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Expiry Date:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  12/12/2025
                </Typography>
              </Grid>
            </Grid>

            <Grid container sx={{ marginTop: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Issuing Authority:
                </Typography>
                <Typography variant="body1" sx={{ color: 'blue' }}>
                  Government of Country
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DocumentComponent;
