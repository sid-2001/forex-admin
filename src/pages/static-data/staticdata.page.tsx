import StaticDataGrid from '@/components/static'
import { staticTableState } from '@/states/state'
import { useRecoilState } from 'recoil'

const StaticData = () => {
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

  return (
    <div style={{ padding: '20px' }}>
      <StaticDataGrid data={[]} apiEndpoint={staticTable.api} primaryKey={staticTable['primary-key']} title={staticTable.listname} />
    </div>
  )
}

export default StaticData
