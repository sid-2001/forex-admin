import React from 'react';
import { Divider, Box } from '@mui/material';
import PropTypes from 'prop-types';

function GradientDivider({ gradient = 'blue, white', width = 100 }) {
  return (
    <Box my={4}>
      <Divider
        sx={{
          height: '2px',
          width: `${width}vw`,
          background: `linear-gradient(to right, ${gradient})`,
          border: 'none',
      
        }}
      />
    </Box>
  );
}

GradientDivider.propTypes = {
  gradient: PropTypes.string,
  width: PropTypes.number,
};

export default GradientDivider;
