import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export const getLiveAuditData = async (latitude: any, longitude: any) => {
  try {
    const res = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=698ec1956567a901751989bigfafd1d`)
    const locResult = await res.json()

    const city = locResult.address.city || locResult.address.town || 'Unknown City'
    const state = locResult.address.state_code || locResult.address.state || ''
    const country = locResult.address.country || ''
    const fullLocation = `${city}, ${state}, ${country}`.toUpperCase()

    const now = new Date()
    const offsetMinutes = -now.getTimezoneOffset()
    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const mins = Math.abs(offsetMinutes) % 60
    const formattedOffset = `${offsetMinutes >= 0 ? '+' : '-'}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

    return {
      location: fullLocation,
      localDateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      utcDateTime: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
      timeZone: ianaTZ,
      offset: formattedOffset,
    }
  } catch (error) {
    console.error('Audit Fetch Error:', error)
    return null
  }
}
