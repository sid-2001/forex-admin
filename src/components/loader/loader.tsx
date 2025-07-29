import { Box } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import { CircularProgress } from '@mui/material'

const LoaderUI = {
  LoaderBackdrop: ({
    //@ts-ignore
    openloader,
    //@ts-ignore
  }) => (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openloader}>
      <Box
        component="img"
        src="https://static.wixstatic.com/media/01fdc7_c4c5d600eec34f26885eabcb5dcc8734~mv2.png/v1/fill/w_237,h_174,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/Social%20Media%20Posts-4.png"
        alt="safas"
        sx={{
          width: '140px', // Adjust size as needed
          height: '100px', // Adjust size as needed
          animation: 'spin 2s linear infinite',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      />
    </Backdrop>
  ),

  LoadingOverlay: () => {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '50vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  },
}

export default LoaderUI
