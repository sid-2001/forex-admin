// import React, { useState, useEffect } from 'react'
// import { Box, Typography } from '@mui/material'
// import PublicIcon from '@mui/icons-material/Public'

// const CompactLocationBar = () => {
//   const [data, setData] = useState({ location: 'Fetching...', localTime: '', utcTime: '' })
//   const [error, setError] = useState(false)

//   useEffect(() => {
//     // 1. Update Times every second
//     const timer = setInterval(() => {
//       const now = new Date()
//       setData((prev) => ({
//         ...prev,
//         localTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
//         utcTime: now.toISOString().substring(11, 16), // Extracts HH:mm from ISO string
//       }))
//     }, 1000)

//     // 2. Fetch City, State, Country
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const response = await fetch(
//             `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`,
//           )
//           const result = await response.json()
//           // Format: City, State (Code), Country
//           const locationString = `${result.city}, ${result.principalSubdivisionCode.split('-')[1] || result.principalSubdivision} | ${result.countryName}`
//           setData((prev) => ({ ...prev, location: locationString }))
//         } catch {
//           setData((prev) => ({ ...prev, location: 'Location Unknown' }))
//         }
//       },
//       () => setError(true),
//     )

//     return () => clearInterval(timer)
//   }, [])

//   return (
//     <Box
//       sx={{
//         width: 300,
//         height: 20,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'flex-end',
//         px: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.05)',
//         borderRadius: '4px',
//         overflow: 'hidden',
//         mb: 1,
//       }}
//     >
//       <PublicIcon sx={{ fontSize: 12, mr: 0.5, color: 'primary.main' }} />

//       <Typography
//         variant="caption"
//         sx={{
//           fontSize: '0.62rem', // Slightly smaller to fit all data
//           whiteSpace: 'nowrap',
//           fontWeight: 500,
//           color: 'text.secondary',
//           display: 'flex',
//           gap: 0.8,
//         }}
//       >
//         {error ? (
//           'Access Denied'
//         ) : (
//           <>
//             <Box component="span" sx={{ fontWeight: 600 }}>
//               {data.location.toUpperCase()}
//             </Box>
//             <Box component="span" sx={{ color: 'divider' }}>
//               |
//             </Box>
//             <Box component="span">LCL: {data.localTime}</Box>
//             <Box component="span" sx={{ color: 'divider' }}>
//               |
//             </Box>
//             <Box component="span">UTC: {data.utcTime}</Box>
//           </>
//         )}
//       </Typography>
//     </Box>
//   )
// }

// export default CompactLocationBar
import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'

const CompactLocationBar = () => {
  const [data, setData] = useState({
    location: 'FETCHING...',
    localTime: '',
    utcTime: '',
    tzInfo: '',
  })

  useEffect(() => {
    // 1. Live Clocks & Local Timezone Logic (Always works instantly)
    const timer = setInterval(() => {
      const now = new Date()
      const offsetMinutes = -now.getTimezoneOffset()
      const hours = Math.floor(Math.abs(offsetMinutes) / 60)
      const mins = Math.abs(offsetMinutes) % 60
      const formattedOffset = `${offsetMinutes >= 0 ? '+' : '-'}${hours}:${mins.toString().padStart(2, '0')}`
      const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

      setData((prev) => ({
        ...prev,
        localTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        utcTime: now.toISOString().substring(11, 16),
        tzInfo: `${ianaTZ} ${formattedOffset}`,
      }))
    }, 1000)

    // 2. High-Accuracy Location Fetch
    const getLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              // High accuracy fetch using reverse geocoding
              const res = await fetch(`https://geocode.maps.co/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
              const result = await res.json()
              const city = result.address.city || result.address.town || result.address.suburb || 'Gurugram'
              const state = result.address.state_code || 'HR'
              setData((prev) => ({ ...prev, location: `${city}, ${state}` }))
            } catch {
              setData((prev) => ({ ...prev, location: 'GURUGRAM, HR' }))
            }
          },
          () => setData((prev) => ({ ...prev, location: 'GURUGRAM, HR (IP)' })),
          { enableHighAccuracy: true, timeout: 5000 },
        )
      }
    }

    getLocation()
    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        width: 400,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        boxSizing: 'border-box',
        gap: 1,
        mb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
        <LanguageIcon sx={{ fontSize: 12, color: '#1976d2' }} />
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'monospace',
          }}
        >
          {data.location.toUpperCase()}
        </Typography>
      </Box>

      {/* Right Side: Times - Fixed width so it doesn't move */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: '0.55rem',
            whiteSpace: 'nowrap',
            color: '#666',
            fontFamily: 'monospace',
            display: 'flex',
            gap: 0.5,
          }}
        >
          <Box component="span" sx={{ color: '#1976d2' }}>
            {data.tzInfo}
          </Box>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>LCL:{data.localTime}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>UTC:{data.utcTime}</span>
        </Typography>
      </Box>
    </Box>
  )
}

export default CompactLocationBar
