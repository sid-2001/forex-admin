import { CountryData } from '@/types/static.type'
import { atom, DefaultValue } from 'recoil'

const localStorageEffect =
  (
    //@ts-ignore
    key,
  ) =>
  //@ts-ignore
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null && savedValue != 'undefined') {
      setSelf(JSON.parse(savedValue))
    }
    //@ts-ignore
    onSet((newValue) => {
      //@ts-ignore
      if (newValue instanceof DefaultValue) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    })
  }

export const sidbarSelectionState = atom({
  key: 'dashboardState',
  default: '',
})

export const availableBalanceState = atom({
  key: 'availableBalanceState',
  default: '0000000',
})

export const role = atom({
  key: 'role',
  default: 'admin',
})

export const loaderState = atom({
  key: 'LoaderState',
  default: false,
})

export const loaderStateNew = atom({
  key: 'LoaderStateNew',
  default: false,
})

export const alertState = atom({
  key: 'alertState',
  default: false,
})

export const alertTextState = atom({
  key: 'alertText',
  default: 'Success',
})

export const alertTypeState = atom({
  key: 'alerttype',
  default: '',
})

// <STUDENT>

export const notificationState = atom({
  key: 'studentlist',
  default: [],
})

export const applicantView = atom({
  key: 'applicantView',
  default: false,
})

export const countyState = atom<Array< CountryData>>({
  key: 'countryList',
  default: [],
    effects_UNSTABLE: [localStorageEffect('countryList')],
})



export const selectedAppState = atom({
  key: 'selectedAppState',
  default: 'Price',
  effects_UNSTABLE: [localStorageEffect('selectedAppState')],
})

export const selectedCountryState = atom({
  key: 'selectedCountryState',
  default: '',
  effects_UNSTABLE: [localStorageEffect('selectedCountryState')],
})

export const staticTableState = atom({
  key: 'staticTableState',
  default: {
    name: 'verification-partner',
    'primary-key': 'verificationPartnerId',
    api: '/api/kyc/verification-partners/action',
    listname: 'Verification Partner',

    updatePrimaryKey: 'partnerId',
  },
  effects_UNSTABLE: [localStorageEffect('staticTableState')],
})
