import React, { useState, useEffect } from 'react'
import { Box, Alert, IconButton, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
const { VITE_APP_BACKEND_NAME } = import.meta.env

interface Notification {
  id: number
  message: string
}

const Notifications: React.FC = () => {
  const [messages, setMessages] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    let ws: WebSocket

    const connectWebSocket = () => {
      ws = new WebSocket(`wss://${VITE_APP_BACKEND_NAME}/api/v1/auth/ws/notifications`) // Replace with your backend URL

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }

      ws.onmessage = (event: MessageEvent) => {
        const newMessage = JSON.parse(event.data).message
        console.log('New Message coming', newMessage)
        setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, message: newMessage }])
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...')
        setIsConnected(false)
        setTimeout(() => connectWebSocket(), 5000) // Reconnect after 5 seconds
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        ws.close()
      }
    }

    connectWebSocket()

    return () => {
      ws.close()
    }
  }, [])

  // Handle dismissing a notification
  const handleDismiss = (id: number) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id))
  }

  return (
    <div>
      <Box p={2}></Box>

      {/* Floating Notification Alerts */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 1300,
        }}
      >
        {messages.map((msg) => (
          <Alert
            key={msg.id}
            severity="error"
            action={
              <IconButton size="small" onClick={() => handleDismiss(msg.id)}>
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {msg.message}
          </Alert>
        ))}
      </Box>
    </div>
  )
}

export default Notifications
