// import React from 'react';
// import { Box, Typography, Grid, Paper } from '@mui/material';
// import Passport from '../../assets/images/Passport_card.jpg';

// type DocumentComponentProps = {
//   applicantId: string;
// };
// //@ts-ignore
// const DocumentComponent: React.FC<DocumentComponentProps> = ({ applicantId }) => {
//   // your code
// };



// export default DocumentComponent;
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ApplicantService } from '@/services/applicant.service';

const applicant_service = new ApplicantService();

const DocumentComponent = ({ applicantId }: { applicantId: string }) => {
  return(
    <>
    
    </>
  );
  
};

export default DocumentComponent;
