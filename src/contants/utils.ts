export const statusColors: any = {
  PENDING: '#ED6D03',
  DRAFT: 'black',
  RELEASED: 'green',
  ACK: 'green',
  NACK: 'red',
  COMPLETED: 'green',
  FAILED: 'red',
  SUCCESS: 'green',
  APPROVED: 'green',
  REJECTED: 'black',
}

export const targetTypes = [
  { label: 'COUNTRY', value: 'COUNTRY' },
  { label: 'TARGET COUNTRY', value: 'TARGET_COUNTRY' },
  { label: 'ALL', value: 'ALL' },
]
export const freqTypes = [
  { label: 'INTERVAL', value: 'INTERVAL' },
  { label: 'DAILY', value: 'DAILY' },
  { label: 'ONE TIME', value: 'ONE_TIME' },
]

export const notificationStatus = [
  { label: 'PERMANENTLY FAILED', value: 'PERMANENTLY_FAILED', color: '#F44336', disabled: true },
  { label: 'RUNNING', value: 'RUNNING', color: '#2196F3', disabled: false },
  { label: 'PAUSED', value: 'PAUSED', color: '#FF9800', disabled: false },
  { label: 'ACTIVE', value: 'ACTIVE', color: '#4CAF50', disabled: false },
  { label: 'SUCCESS', value: 'SUCCESS', color: 'green', disabled: false },
  { label: 'PENDING', value: 'PENDING', color: '#ED6D03', disabled: false },
  { label: 'DRAFT', value: 'DRAFT', color: 'black', disabled: false },
  { label: 'COMPLETED', value: 'COMPLETED', color: 'green', disabled: false },
]

export const targetTypeMap = Object.fromEntries(targetTypes.map((item) => [item.value, item.label]))
export const freqTypeMap = Object.fromEntries(freqTypes.map((item) => [item.value, item.label]))
export const getNotificationStatusLabel = (value: string) => notificationStatus.find((item) => item.value === value)?.label || value
export const getNotificationStatusColor = (value: string) => notificationStatus.find((item) => item.value === value)?.color || '#000'
