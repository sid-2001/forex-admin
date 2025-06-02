import { Box, Typography } from '@mui/material'
// import './index.css'
import { theme } from '../../contants/theme'

function IndexPage() {
  return (
    <>
      <Box
        sx={{
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          // height: 'calc(100vh - 142px)',
          borderRadius: '12px',
          margn: 'auto',
        }}
      >
        <Typography variant="h1"></Typography>
        <Typography variant="h6" color={theme.palette.grey[500]}>
          Coming Soon
        </Typography>
      </Box>
    </>
  )
}

export default IndexPage
