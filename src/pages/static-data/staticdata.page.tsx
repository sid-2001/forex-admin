import StaticDataGrid from '@/components/static'
import { staticTableState } from '@/states/state'
import { useRecoilState } from 'recoil'

const StaticData = () => {
  // Example 1: Payment Gateways

  //@ts-ignore
  const [staticTable, setStaticTable] = useRecoilState<{
    name: string
    'primary-key': string
    api: string
    listname: string
    updatePrimaryKey: String
  }>(
    //@ts-ignore
    staticTableState,
  )

  const gatewayData = [
    {
      id: 'GW001',
      countryCode: 'IN',
      company: 'Paytm',
      gatewayLink: 'https://paytm.com',
      costFee: 10.25,
      currencyMode: 'INR',
      paymentGateway: 'Paytm Gateway',
      imageUrl: 'https://images.paytm.com/icon.png',
    },
    // More data...
  ]

  // Example 2: User Data
  const userData = [
    {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Admin',
      joinDate: '2023-01-15',
    },
    // More data...
  ]

  return (
    <div style={{ padding: '20px' }}>
      <StaticDataGrid data={[]} apiEndpoint={staticTable.api} primaryKey={staticTable['primary-key']} title={staticTable.listname} />
    </div>
  )
}

export default StaticData
