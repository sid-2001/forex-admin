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

  const fetchProductConfig = async (countryCode: string) => {
    try {
      const service = new ProductConfigService()
      const res = await service.getByCountryCode(countryCode)
      if (res?.status && res?.data?.length > 0) {
        localStorage.setItem('countryConfig', JSON.stringify(res.data[0]))
      }
    } catch (error) {
      console.error('Error fetching product config:', error)
    }
  }

  const setGurugramFallback = () => {
    setData((prev) => ({ ...prev, location: 'GURUGRAM, HR, INDIA' }))
    fetchProductConfig('IN')
  }

  useEffect(() => {
    // 1. Real-time Clock
    const timer = setInterval(() => {
      const now = new Date()
      const offsetMinutes = -now.getTimezoneOffset()
      const hours = Math.floor(Math.abs(offsetMinutes) / 60)
      const mins = Math.abs(offsetMinutes) % 60
      const formattedOffset = `GMT${offsetMinutes >= 0 ? '+' : '-'}${hours}:${mins.toString().padStart(2, '0')}`
      const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

      setData((prev) => ({
        ...prev,
        localTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        utcTime: now.toISOString().substring(11, 16),
        tzInfo: `${ianaTZ} ${formattedOffset}`,
      }))
    }, 1000)

    // 2. Open Source Geolocation (Nominatim)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=en`
            const response = await fetch(url, { headers: { 'User-Agent': 'ImproPay/1.0' } })
            const result = await response.json()

            const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
            const isIndiaTimezone = ianaTZ.includes('Calcutta') || ianaTZ.includes('Kolkata')

            if (result && result.address) {
              const addr = result.address
              const countryCode = addr.country_code?.toUpperCase() || 'IN'

              // Open Source "Münster" Fix: If TZ is India but API returns Germany, show Gurugram
              if (isIndiaTimezone && countryCode !== 'IN') {
                return setGurugramFallback()
              }

              const city = addr.city || addr.town || addr.village || 'GURUGRAM'
              const state = addr.state || 'HR'
              const country = addr.country || 'INDIA'

              setData((prev) => ({
                ...prev,
                location: `${city}, ${state}, ${country}`,
              }))
              fetchProductConfig(countryCode)
            } else {
              setGurugramFallback()
            }
          } catch (error) {
            setGurugramFallback()
          }
        },
        () => setGurugramFallback(),
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      setGurugramFallback()
    }

    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 450,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        gap: 1,
        mb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
        <LanguageIcon sx={{ fontSize: 13, color: 'primary.main' }} />
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'monospace',
            color: '#222',
          }}
        >
          {data.location.toUpperCase()}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.6rem', whiteSpace: 'nowrap', color: 'text.secondary', display: 'flex', gap: 0.8, fontFamily: 'monospace' }}>
        <Box component="span" sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
          {data.tzInfo}
        </Box>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>LCL: {data.localTime}</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>UTC: {data.utcTime}</span>
      </Typography>
    </Box>
  )
}

export default CompactLocationBar
