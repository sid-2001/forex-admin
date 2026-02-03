import { Typography } from '@mui/material'

const ErrorMessage = ({ errMessage }: any) => {
  return (
    <Typography
      align="center"
      color="error"
      variant="body2"
      sx={{
        mt: 1,
        animation: errMessage ? 'shake 0.3s' : 'none',
        '@keyframes shake': {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-4px)' },
          '100%': { transform: 'translateX(0)' },
        },
      }}
    >
      {errMessage}
    </Typography>
  )
}

export default ErrorMessage
