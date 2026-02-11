// import React, { useState, useEffect } from 'react'
// import { Box, Typography } from '@mui/material'
// import LanguageIcon from '@mui/icons-material/Language'

// const CompactLocationBar = () => {
//   const [data, setData] = useState({
//     location: 'FETCHING...',
//     localTime: '',
//     utcTime: '',
//     tzInfo: '',
//   })

//   // Function to fetch Country Corridor Product and store in LocalStorage
//   const fetchProductConfig = async (countryCode) => {
//     try {
//       const response = await fetch(`http://64.227.139.142:9091/api/static-table/countryCorridorProduct/getByCountryCode/${countryCode}`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       })

//       const result = await response.json()

//       if (result.status && result.data && result.data.length > 0) {
//         // Store only the first element of the array in LocalStorage
//         localStorage.setItem('countryConfig', JSON.stringify(result.data[0]))
//         console.log('Stored Config:', result.data[0])
//       }
//     } catch (error) {
//       console.error('Error fetching product config:', error)
//     }
//   }

//   useEffect(() => {
//     // 1. Live Clock Timer
//     const timer = setInterval(() => {
//       const now = new Date()
//       const offsetMinutes = -now.getTimezoneOffset()
//       const hours = Math.floor(Math.abs(offsetMinutes) / 60)
//       const mins = Math.abs(offsetMinutes) % 60
//       const formattedOffset = `${offsetMinutes >= 0 ? '+' : '-'}${hours}:${mins.toString().padStart(2, '0')}`
//       const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

//       setData((prev) => ({
//         ...prev,
//         localTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
//         utcTime: now.toISOString().substring(11, 16),
//         tzInfo: `${ianaTZ} ${formattedOffset}`,
//       }))
//     }, 1000)

//     // 2. Dynamic Location + Product Fetch
//     if ('geolocation' in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (pos) => {
//           try {
//             const res = await fetch(`https://geocode.maps.co/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
//             const locResult = await res.json()

//             const city = locResult.address.city || locResult.address.town || 'Gurugram'
//             const state = locResult.address.state_code || 'HR'
//             const countryCode = locResult.address.country_code?.toUpperCase() || 'IN'

//             setData((prev) => ({ ...prev, location: `${city}, ${state}` }))

//             // Call your custom API with the detected country code
//             fetchProductConfig(countryCode)
//           } catch {
//             setData((prev) => ({ ...prev, location: 'GURUGRAM, HR' }))
//             fetchProductConfig('IN') // Fallback for your API
//           }
//         },
//         () => {
//           setData((prev) => ({ ...prev, location: 'GURUGRAM, HR (IP)' }))
//           fetchProductConfig('IN')
//         },
//         { enableHighAccuracy: true, timeout: 5000 },
//       )
//     }

//     return () => clearInterval(timer)
//   }, [])

//   return (
//     <Box
//       sx={{
//         width: 400,
//         height: 20,
//         display: 'flex',
//         alignItems: 'center',
//         px: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.04)',
//         borderRadius: '4px',
//         border: '1px solid rgba(0,0,0,0.1)',
//         boxSizing: 'border-box',
//         gap: 1,
//         mb: 1,
//       }}
//     >
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
//         <LanguageIcon sx={{ fontSize: 11, color: 'primary.main' }} />
//         <Typography
//           sx={{ fontSize: '0.55rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}
//         >
//           {data.location.toUpperCase()}
//         </Typography>
//       </Box>

//       <Typography sx={{ fontSize: '0.55rem', whiteSpace: 'nowrap', color: 'text.secondary', display: 'flex', gap: 0.5, fontFamily: 'monospace' }}>
//         <Box component="span" sx={{ color: 'primary.dark' }}>
//           {data.tzInfo}
//         </Box>
//         <span style={{ opacity: 0.3 }}>|</span>
//         <span>LCL:{data.localTime}</span>
//         <span style={{ opacity: 0.3 }}>|</span>
//         <span>UTC:{data.utcTime}</span>
//       </Typography>
//     </Box>
//   )
// }

// export default CompactLocationBar
import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import ProductConfigService from '@/services/product.config.service'

const CompactLocationBar = () => {
  const [data, setData] = useState({
    location: 'FETCHING...',
    localTime: '',
    utcTime: '',
    tzInfo: '',
  })

  // const fetchProductConfig = async (countryCode: any) => {
  //   try {
  //     const response = await fetch(`https://api.impronics.com/api/static-table/countryCorridorProduct/getByCountryCode/${countryCode}`, {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' },
  //     })

  //     const result = await response.json()

  //     if (result.status && result.data && result.data.length > 0) {
  //       localStorage.setItem('countryConfig', JSON.stringify(result.data[0]))
  //     }
  //   } catch (error) {
  //     console.error('Error fetching product config:', error)
  //   }
  // }
  const fetchProductConfig = async (countryCode: string) => {
    try {
      // const res = await ProductConfigService.getByCountryCode(countryCode)
      const service = new ProductConfigService()
      const res = await service.getByCountryCode(countryCode)
      console.log('jdbchy')
      if (res?.status && res?.data?.length > 0) {
        console.log(res.data[0], 'res.data[0]')
        alert(res.data[0])
        localStorage.setItem('countryConfig', JSON.stringify(res.data[0]))
      }
    } catch (error) {
      console.error('Error fetching product config:', error)
    }
  }

  useEffect(() => {
    // 1. Live Clock Timer
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

    // 2. Dynamic Location + Product Fetch
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://geocode.maps.co/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            const locResult = await res.json()

            // Extracts City, State Code, and Full Country Name
            const city = locResult.address.city || locResult.address.town || 'Gurugram'
            const state = locResult.address.state_code || 'HR'
            const country = locResult.address.country || 'India'
            const countryCode = locResult.address.country_code?.toUpperCase() || 'IN'

            setData((prev) => ({
              ...prev,
              location: `${city}, ${state}, ${country}`,
            }))

            fetchProductConfig(countryCode)
          } catch {
            setData((prev) => ({ ...prev, location: 'GURUGRAM, HR, INDIA' }))
            fetchProductConfig('IN')
          }
        },
        () => {
          setData((prev) => ({ ...prev, location: 'GURUGRAM, HR, INDIA (IP)' }))
          fetchProductConfig('IN')
        },
        { enableHighAccuracy: true, timeout: 5000 },
      )
    }

    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        width: 400, // Kept at 400px to fit City, State, and Country
        height: 20,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        gap: 1,
        mb: 1,
      }}
    >
      {/* Location Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
        <LanguageIcon sx={{ fontSize: 11, color: 'primary.main' }} />
        <Typography
          sx={{
            fontSize: '0.55rem',
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

      {/* Time & Timezone Section */}
      <Typography
        sx={{
          fontSize: '0.55rem',
          whiteSpace: 'nowrap',
          color: 'text.secondary',
          display: 'flex',
          gap: 0.5,
          fontFamily: 'monospace',
        }}
      >
        <Box component="span" sx={{ color: 'primary.dark' }}>
          {data.tzInfo}
        </Box>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>LCL:{data.localTime}</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>UTC:{data.utcTime}</span>
      </Typography>
    </Box>
  )
}

export default CompactLocationBar
