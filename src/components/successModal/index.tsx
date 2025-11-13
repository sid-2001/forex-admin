import React, { useEffect, useState } from 'react'
import { Modal, Box, Button } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TransactionService } from '@/services/transaction.service'

const { VITE_APP_URL } = import.meta.env
const GifModal: React.FC = () => {
  const handleOpen = () => setOpen(true)
  const [open, setOpen] = useState(true)
 const [searchParams, setSearchParams] = useSearchParams();

  let navigate = useNavigate()
  const transaction_service=new TransactionService()
  const handleClose = () => {
    setOpen(false)

    navigate('/transaction')
  }

  useEffect(() => {
    setOpen(true)
  }, [])

  setTimeout(() => {
    setOpen(false)
    window.location.replace(`${VITE_APP_URL}/transaction`)
  }, 3000)


  useEffect(()=>{
    if(searchParams.get("payfastdata")){
      let payfast=searchParams.get("payfastdata")
          const decoded = decodeURIComponent(payfast as any);
        const parsed = JSON.parse(decoded);
        console.log(parsed)

   transaction_service.createTransaction(parsed)

    }

  },[]

  )
  return (
    <>
      {/* Button to open the modal */}

      {/* Modal component */}
      <Modal open={open} onClose={handleClose} aria-labelledby="gif-modal-title" aria-describedby="gif-modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          {/* GIF */}
          <img
            src={ searchParams.get("status")=="success"?"https://i.pinimg.com/originals/90/13/f7/9013f7b5eb6db0f41f4fd51d989491e7.gif":"https://i0.wp.com/nrifuture.com/wp-content/uploads/2022/05/comp_3.gif?fit=800%2C600&ssl=1"} 
            alt="Loading GIF"
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />

          {/* Close button */}
          <Button onClick={handleClose} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  )
}

export default GifModal
