import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'

const geoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface Props {
  data: {
    country: string
    volume: number
    transactions: number
  }[]

  selectedCountry?: string | null
}

const countryCoordinates: Record<
  string,
  [number, number]
> = {
  IN: [78.9629, 20.5937],
  PK: [69.3451, 30.3753],
  BD: [90.3563, 23.685],
  NP: [84.124, 28.3949],
  LK: [80.7718, 7.8731],
  AE: [53.8478, 23.4241],
  SA: [45.0792, 23.8859],
  QA: [51.1839, 25.3548],
  KW: [47.4818, 29.3117],
  OM: [55.9754, 21.4735],
  US: [-95.7129, 37.0902],
  GB: [-3.436, 55.3781],
  ZA: [22.9375, -30.5595],
}

const zoomCoordinates: Record<
  string,
  {
    center: [number, number]
    scale: number
  }
> = {
  IN: {
    center: [78, 22],
    scale: 400,
  },

  PK: {
    center: [69, 30],
    scale: 450,
  },

  BD: {
    center: [90, 24],
    scale: 700,
  },

  NP: {
    center: [84, 28],
    scale: 700,
  },

  LK: {
    center: [81, 8],
    scale: 900,
  },

  ZA: {
    center: [24, -29],
    scale: 300,
  },

  US: {
    center: [-98, 39],
    scale: 180,
  },

  GB: {
    center: [-3, 55],
    scale: 700,
  },
}

const TransactionWorldMap = ({ data , selectedCountry }: Props) => {
  const maxVolume = Math.max(
    ...data.map((x) => x.volume),
    1
  )

  const zoom =
  selectedCountry &&
  zoomCoordinates[selectedCountry]
    ? zoomCoordinates[selectedCountry]
    : {
        center: [0, 20] as [number, number],
        scale: 140,
      }

console.log(
  'SELECTED COUNTRY',
  selectedCountry
)

const usedPositions: [number, number][] = []

const getAdjustedCoords = (
  coords: [number, number]
): [number, number] => {
  let [lng, lat] = coords

  for (const [usedLng, usedLat] of usedPositions) {
    const distance = Math.sqrt(
      Math.pow(lng - usedLng, 2) +
      Math.pow(lat - usedLat, 2)
    )

    if (distance < 10) {
      lng += 4
      lat += 2
    }
  }

  usedPositions.push([lng, lat])

  return [lng, lat]
}

  return (
    <ComposableMap
  projection="geoMercator"
  projectionConfig={{
    center: zoom.center,
    scale: zoom.scale,
  }}
      style={{
        width: '100%',
        height: '500px',
      }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo: any) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#E5E7EB"
              stroke="#FFFFFF"
              strokeWidth={0.5}
              style={{
                default: {
                  outline: 'none',
                },
                hover: {
                  fill: '#BFDBFE',
                  outline: 'none',
                },
                pressed: {
                  outline: 'none',
                },
              }}
            />
          ))
        }
      </Geographies>

      {data.map((item) => {
        const coords =
          countryCoordinates[item.country]

        if (!coords) return null

        const adjustedCoords =
  getAdjustedCoords(coords)

       const radius = Math.min(
  (item.volume / maxVolume) * 20 + 5,
  22
)

        return (
          <Marker
            key={item.country}
            coordinates={adjustedCoords}
          >
            <circle
              r={radius}
              fill="#2563EB"
              fillOpacity={0.45}
              stroke="#1D4ED8"
              strokeWidth={2}
            />

            <title>
              {item.country}
              {'\n'}
              Volume: AED{' '}
              {Number(
                item.volume
              ).toLocaleString()}
              {'\n'}
              Transactions:{' '}
              {item.transactions}
            </title>
          </Marker>
        )
      })}
    </ComposableMap>
  )
}

export default TransactionWorldMap